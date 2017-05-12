#import mysql.connector as mdb
from config import API_KEY
import pandas as pd
import requests
import json
from pandas.io.sql import DatabaseError
#from mysql.connector.errors import Error
import MySQLdb as mdb
import time
import datetime

#Return database connection
def connect_to_database(_user, _password, _dbname, _host='127.0.0.1', _port=3306):
    conn = mdb.connect(
        host=_host,
        port=_port,
        user=_user,
        passwd=_password,
        db=_dbname
        )
    return conn


def check_veh_trip_id(conn, veh_trip_id):
    query = "SELECT DISTINCT(veh_trip_id) FROM google_snap_gps"
    result = generate_dict_from_sql(query, conn)
    
    if len(result) == 0:
        return False
    
    _allIds = [x['veh_trip_id'] for x in result]

    if veh_trip_id in _allIds:
        
        return True
    else:
        
        return False

def insert_into_google_table(conn, json, veh_trip_id):
    cursor = conn.cursor()
    
    data = []
    for x in json:
        if x.has_key('originalIndex') and x.has_key("placeId"):
            bit = (veh_trip_id, x["location"]["latitude"], x["location"]["longitude"], x['originalIndex'], x['placeId'])
        
        elif x.has_key('placeId'):
            bit = (veh_trip_id, x["location"]["latitude"], x["location"]["longitude"], None, x['placeId'])
        else:
            bit = (veh_trip_id, x["location"]["latitude"], x["location"]["longitude"], None, None)
        
        data.append(bit)
    
    sql = "INSERT INTO google_snap_gps (veh_trip_id, lat, lng, originalIndex, placeId) VALUES (%s, %s, %s, %s, %s)"

    try:
        cursor.executemany(sql, data)
    except:
        print "Failed to insert"
    else:
        conn.commit()
        
        print "%s records successfully added to google_snap_gps table for id %s" %(len(data), data[0][0])
        cursor.close()



def generate_dict_from_sql(query, conn, keep_datetime=True):
    '''
    keep_datetime: If False, it will be converted to string %Y-%m-%d %H:%M:%S
    '''
    
    cursor = conn.cursor()
    try:
        cursor.execute(query)

    except:
        return []
    columns = [each[0] for each in cursor.description]
    results=[]
    for each in cursor.fetchall():
        if not keep_datetime: each = map(lambda x: x.strftime('%Y-%m-%d %H:%M:%S') if type(x) in [datetime.datetime, datetime.date] else x, each)
        results.append(dict(zip(columns,each)))
    return results


# SQL -> Pandas
def clean_veh_trip_table(conn, veh_trip_id):
    '''
        Return value:
         index[0] - dataframe if success, empty list if fail
         index[1] - message
    '''
    
    query = '''SELECT * FROM veh_trip_detail WHERE veh_trip_id=%s'''%(veh_trip_id)

    try:
        df = pd.read_sql_query(query, conn)
    except DatabaseError:
        return None, "Database error: Check query: %s" % query
        
    #Exit function if no tables found 
    if df.empty or type(df) is not pd.DataFrame:
        return None, "veh_trip_id %s does not exist on Database" % veh_trip_id

    # Cleaning: Remove lat and lng =0 or NAN, then sort by seq_no
    df = df.loc[(df["lat"] != 0.) & (df["lng"] != 0.), ["seq_no", "lat", "lng"]].dropna().sort_values(by="seq_no")

    if df.empty:
        return None, "No readable gps values for veh_trip_id %s"% veh_trip_id
    
    return df, "DataFrame of size %s"%df.shape[0]




# DF -> chunks<list> -> Google
def retrieve_json_from_google(df, API_KEY=API_KEY):
    
    #Turn the dataframe into numpy array of lat/lng pairs
    long_lat_values = df.loc[:, ["lat", "lng"]].values
    length = len(long_lat_values)

    ##Breaking lat/lng into 100 pairs per chunk for Google API
    # Iterate through every 100 index on lat/lng pairs
    # Create a list of string consisting of lat and lng pairs that fits the API requirement:
    # chunks = ['lat,lng|lat,lng|lat,lng|...', 'lat,lng|lat,lng|lat,lng|...', 'lat,lng|lat,lng|lat,lng|...'] 
    chunks = []
    for i in range(0, length, 100):
        chunk = long_lat_values[i:i+100]

        #GOOGLE API Formatting: lat,lng| lat,lng| .....
        chunk = ["%s,%s"%(str(x[0]), str(x[1])) for x in chunk]
        chunk = "|".join(chunk)
        chunks.append(chunk)

    

    #GOOGLE API Feeding
    #Iterate through chunks
    #for each chunk, GET response from google api and concatenate to smoothened_data
    url = "https://roads.googleapis.com/v1/snapToRoads"
    smoothened_data = []
    last_count = 0

    for i in range(0, len(chunks)):
        
        parameters= {
            'path': chunks[i],
            'key': API_KEY,
            'interpolate': True
        }

        response = requests.get(url, params=parameters)

        ##Prevent rate limiting: 50 requests per second
        #Pausing the program before every 50th request
        if (i+1)%50 == 0:
            time.sleep(1)
        
        ## Success case:
        if response.status_code == 200:
            results = response.json()

            if results.has_key('snappedPoints'):
                # if results is a dictionary with key 'snappedPoints'
                # results contains the smoothened Points returned from google
                results = results['snappedPoints']

                ##Updating originalIndex for each chunk to ensure continuity, using _lastIndex to keep track
                if i == 0:
                    last_count =list(filter( lambda x: x.has_key('originalIndex'), results))[-1]['originalIndex']
                else:
                    _lastIndex = 0
                    for result in results:
                        if result.has_key('originalIndex'):
                            result['originalIndex'] = result['originalIndex'] + last_count + 1
                            _lastIndex = result['originalIndex']

                    last_count = _lastIndex
                print "Chunk %s contains %s, Google returns %s "%(i, chunks[i].count('|')+1,len(results))
            else:
                #If results doesn't have snappedPoints as key
                results = []
            
            # concatenate list to bigger list smoothened_data
            smoothened_data = smoothened_data + results

        elif response.status_code == 429:
            ## handling rate-limited event
            error = response.json()
            return [], error['error']['message']  

    if len(smoothened_data) == 0: message = "Google Snap API did not return any values"
    else: message ="GOOGLE API SUCCESS, %s data returned"% len(smoothened_data)
    
    return smoothened_data, message


def retrieve_table(query_args, conn, json_format=False):
    '''
    params:
        1) query_args: List of arguments related to the Database
            -index[0]: <Table name> <string>
            -index[1]: <Key of table> <int> <?optional>
            -index[2]: <start_time> <datetime.datetime> <Only for "log_data" table>
            -index[3]: <end_time> <datetime.datetime> <Only for "log_data" table>
        
        2) conn: An instance of MySQL database connection
            *Must be provided
            for non-API calls, use the connect_to_database provided in this file

        3) json_format: Boolean
            True: result will be in Json format
            False: result will be in pandas table

    Return values: 
        index[0] - Json/ pandas
        index[1]- message
    '''
    
    if query_args[0] in ["veh_trip_detail", "veh_trip"]:

        column = "vrm_id" if query_args[0] == 'veh_trip' else "veh_trip_id"
        query = "SELECT * FROM %s WHERE %s = %s"%(query_args[0], column, query_args[1])


    elif query_args[0] == 'log_data':
       
        column = "vrm_id"
        query ="SELECT * FROM %s WHERE %s = %s AND start_time >= '%s' AND end_time <= '%s'"%(query_args[0], column, query_args[1], query_args[2], query_args[3])

    else:
        query = "SELECT * FROM %s"%query_args[0]
    
    print query
    try:
        data = pd.read_sql_query(query, conn)

    except DatabaseError:
        return [], "Check your query (%s)"%query

    if data.empty:
        form = "json" if json_format else "dataframe"
        return [], "Returned empty %s"% form

    if json_format:
        ## Restful Call: return JSON 
        df_to_json = data.to_json(orient='records', lines= False)
        json_data = json.loads(df_to_json)

        if type(json_data) is list:
            return json_data, "Success"
        else:
            return [], "Couldnt convert dataframe to json"
    else:
        ## non-Restful Call: return pandas dataframe
        return data, "Success"






