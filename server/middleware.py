

# -*- coding: UTF-8 -*-
from config import API_KEY
import pandas as pd
import requests
import json
from pandas.io.sql import DatabaseError
import MySQLdb as mdb
import time
import datetime
from config import baidu_apk, baidu_service_id, db_username, db_name, db_password, host, port


#Return database connection
def connect_to_database(_user, _password, _dbname, _host='127.0.0.1', _port=3306):
    conn = mdb.connect(
        host=_host,
        port=_port,
        user=_user,
        passwd=_password,
        db=_dbname,
        use_unicode=True,
        charset='utf8'
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
    keep_datetime: If False, it will be converted to unix timestamp
    '''
    
    cursor = conn.cursor()
    try:
        cursor.execute(query)
    except:
        #conn = connect_to_database(db_username, db_password, db_name, host, port)
        return []
    columns = [each[0] for each in cursor.description]
    results=[]
    for each in cursor.fetchall():
        if not keep_datetime: each = map(lambda x: int(time.mktime(x.timetuple())) if type(x) in [datetime.datetime, datetime.date] else x, each)
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
    
    if query_args[0] in ["veh_trip_detail", "veh_trip", "veh_trip_by_driver"]:

        if query_args[0] == "veh_trip_by_driver" :   
            column = "driver_id"
            query = "SELECT * FROM %s WHERE %s = %s"%("veh_trip", column, query_args[1])
        else :
            column = "vrm_id" if query_args[0] == 'veh_trip' else "veh_trip_id"
            query = "SELECT * FROM %s WHERE %s = %s"%(query_args[0], column, query_args[1])

    elif query_args[0] == 'authentication':

        print query_args

        #query = "SELECT fullname, company_id, lang, map, group_id FROM %s WHERE username = '%s' and password = '%s' and company_id = %s"%('user_account', query_args[1], query_args[2], query_args[3])
        query = "SELECT a.fullname, a.company_id, a.lang, '' as map, group_id FROM user_account a, company b where a.company_id = b.company_id and a.username = '%s' and password = '%s' and b.company_code = '%s'"%(query_args[1], query_args[2], query_args[3])

        print "Authentication"
        print query

    elif query_args[0] == 'log_data':
       
        column = "vrm_id"
        query ="SELECT * FROM %s WHERE %s = %s AND start_time >= '%s' AND end_time <= '%s'"%(query_args[0], column, query_args[1], query_args[2], query_args[3])

    else:
        query = "SELECT * FROM %s"%query_args[0]
    
    print query

    data = generate_dict_from_sql(query, conn, keep_datetime=False)

    if not data:
        return [], "Empty list"

    if json_format:
        #Returning json
        return data, "Success"

    else:
        columns = data[0].keys()
        data = pd.DataFrame(data, columns=columns)
        return data, "Success"



#Perform insertion into avg_warning_table
## Issue: type in group_table is minimum of vehicle type within a group
def insert_into_warning_grp_table(conn):

    # SQL statement will perform aggregation for each group (vrm_grp_id)
    sql = "SELECT a.vrm_grp_id, 'D' as type, c.start_date as start_date, Null as end_date,\
SUM(c.drv_distance) as drv_distance, SUM(c.drv_duration) as drv_duration, SUM(c.idle_duration_trf) as idle_duration_trf,\
SUM(c.idle_duration_non_trf) as idle_duration_non_trf, SUM(c.fuel_usage) as fuel_usage, AVG(c.total_score) as total_score,\
AVG(c.fcw_score) as fcw_score, AVG(c.ufcw_h_score) as ufcw_h_score, AVG(c.vb_score) as vb_score,\
AVG(c.hmw_h_score) as hmw_h_score, AVG(c.hmw_m_score) as hmw_m_score, AVG(c.hmw_l_score) as hmw_l_score,\
AVG(c.pcw_score) as pcw_score, AVG(c.lldw_score) as lldw_score, AVG(c.rldw_score) as rldw_score,\
AVG(c.spw_score) as spw_score, AVG(c.aaw_score) as aaw_score, AVG(c.abw_score) as abw_score,\
AVG(c.atw_score) as atw_score, SUM(c.fcw) as fcw, SUM(c.ufcw_h) as ufcw_h, SUM(c.vb) as vb, SUM(c.hmw_h) as hmw_h,\
SUM(c.hmw_m) as hmw_m, SUM(c.hmw_l) as hmw_l, SUM(c.pcw) as pcw,\
SUM(c.lldw) as lldw, SUM(c.rldw) as rldw, SUM(c.spw) as spw,\
SUM(c.aaw) as aaw, SUM(c.abw) as abw, SUM(c.atw) as atw FROM veh_reg_mark_group_dtl a, veh_reg_mark_group b, avg_warning_vrm c where a.vrm_grp_id = b.vrm_grp_id and a.vrm_id = c.vrm_id and c.type = 'D' GROUP BY a.vrm_grp_id, c.start_date"

    print sql
    
    try:
        df = pd.read_sql_query(sql, conn)
    except pd.io.sql.DatabaseError as e:
        return e

    #Convert to datetime
    df['start_date'] = pd.to_datetime(df['start_date'], format='%Y-%m-%d')
    
    #Create new columns:
    df['create_ts'] = pd.datetime.now()
    ##Setting default as System for user and 0 for version
    df['create_user'] = 'System'
    df['version'] = 0

    #Extract the names of the columns in order to be used in the SQL insert statement
    columns = ', '.join(df.columns.tolist())

    #Transform the dataframe into a JSON list
    df =json.loads(df.to_json(orient='values', date_format='iso', date_unit='s'))

    instances = []

    #Change the JSON list into instances for SQL insertion
    #convert the date strings to this form  YYYY-MM-DD HH:MM:SS
    for row in df:
        row[2] = row[2].replace("T", " ")
        row[2] = row[2].replace("Z","")
        row[-3] = row[-3].replace("T", " ")
        row[-3] = row[-3].replace("Z","")
        row = tuple(row)
        instances.append(row)

    format_string = '%s,' * len(instances[0])
    insert_statement = "INSERT INTO avg_warning_vrm_grp(%s) VALUES (%s)"%(columns,format_string[:-1])

    cursor = conn.cursor()
    try:
        cursor.executemany(insert_statement,instances)
    except mdb.Error as e:
        return e
    conn.commit()
    return "%s records successfully added to avg_warning_vrm_grp table"% (len(instances))


class from_Baidu(object):
    #class-level attributes 
    start_time = None
    end_time = None

    @staticmethod
    def check_exist(veh_trip_id, conn):
        statement = generate_dict_from_sql("SELECT lat, lng, unix_timestamp(loc) as loc FROM ui_baidu_snap_gps WHERE veh_trip_id = %s"%veh_trip_id, conn)
        if not statement:
            return False, None
        else:
            statement = [(each['lat'], each['lng'], int(each['loc']) ) for each in statement]
            print statement
            return True, statement

    @staticmethod
    def add_entity(veh_trip_id):
        ##Adding entity
        body = {
            'ak': baidu_apk,
            'service id': baidu_service_id,
            'entity name': veh_trip_id,
        }

        response = requests.post('http://yingyan.baidu.com/api/v3/entity/add', data=body)
        result = response.json()
        if result['status'] == 0:
            return True
        else:
            print result['message']
            return False
    
    @staticmethod
    def break_evenly(data,n=50):
        for i in range(0, len(data), n):
            yield data[i:i+n]

    @staticmethod
    def get_track(start_time, end_time, entity):
        params = {
            'ak' : baidu_apk,
            'service_id':  baidu_service_id,
            'entity_name': entity,
            'start_time': start_time,
            'end_time': end_time,
            'is_processed': 1,
            'process_option': 'need_mapmatch=1',
            'page_size' : 5000,
            'coord_type_output': 'bd09ll'
        }

        response = requests.get("http://yingyan.baidu.com/api/v3/track/gettrack", params = params)

        result = response.json()
        if result['status'] == 0:
            result =  [ (point['latitude'], point['longitude'], point['loc_time']) for point in result['points'] ]

            return result
        else:
	    return "0 for the null"
            return [(point['0'], point['0'], point['0'])]

    @staticmethod
    def delete_entity(entity):
        url = 'http://yingyan.baidu.com/api/v3/entity/delete'
        body = {
            'ak' : baidu_apk, 
            'service_id': baidu_service_id,
            'entity_name': entity
        }

        requests.post(url, data=body)

    @classmethod
    def add_points(cls, conn, veh_trip_id, delay_between_calls=5):

        sql_data = generate_dict_from_sql("SELECT unix_timestamp(time) as time,lat,lng FROM veh_trip_detail WHERE veh_trip_id = %s AND lat <> 0 AND lng <> 0 ORDER BY seq_no"%veh_trip_id, conn)
        
        if len(sql_data) > 0:
            cls.start_time = sql_data[0]['time']
            cls.end_time = sql_data[-1]['time']
        print "%s Before reduction: "%veh_trip_id, len(sql_data)

        #Perform reduction on sql_data if it is has more than 300 points
        #Select first point of every 10 seq_no
        if len(sql_data) > 300:
            reduced_data = []
            for i in range(0, len(sql_data), 10):
                reduced_data.append(sql_data[i])
            sql_data = reduced_data
        print "%s After reduction: "%veh_trip_id, len(sql_data)

        counter = 1
        #Feed to Baidu API by chunk of 50 points
        for chunk in cls.break_evenly(sql_data):
            
            #Reformat data to fit baidu API call for this chunk

        
            baidu_feed = [
                {
                    'entity_name': veh_trip_id,
                    'loc_time': row['time'],
                    'latitude': row['lat'],
                    'longitude': row['lng'],
                    "coord_type_input": "wgs84"
                }
                for row in chunk
            ]

            body = {
                'ak' : baidu_apk,
                'service id': baidu_service_id,
                'point_list': json.dumps(baidu_feed)
            }

            response = requests.post("http://yingyan.baidu.com/api/v3/track/addpoints", data=body)
            result = response.json()
            if result['status'] == 0:
                print "Chunk %s successfully posted to BAIDU"%counter
            elif result['status'] in [1, 401]:
		print str(result['status']) + " " + result['message']
		# Wait for 40s  and retry to add the points
		print "Wait for 20s"
		time.sleep(20)
		response = requests.post("http://yingyan.baidu.com/api/v3/track/addpoints", data=body)	
		result = response.json()
		if result['status'] == 0:	
			print "Chunk %s successfully posted to BAIDU"%counter
		else:
			# if still fail after retry return 
		 	print "Failed after retry, now stop the addpoint"
			return result['status'] 
	    else :
                #print json.dumps([result['message']], ensure_ascii=False)[0]
                print result['message']
		print result['status']
		print "Failed with error from Baidu API, now stop the addpoint"
		return result['status']

            #Put on timer to introduce pause between calls
            if counter % 2 == 0:
		print "Wait for " + str(delay_between_calls)
                time.sleep(delay_between_calls)
            counter+=1


class CronJobs(object):
    
    @staticmethod
    def insert_into_baidu_db(conn, instances, trip_id):
        statement = "INSERT INTO ui_baidu_snap_gps (veh_trip_id, lat, lng, loc) VALUES (%s, %s, %s, %s)"
        points = []
        for instance in instances:
            loc = datetime.datetime.fromtimestamp(int(instance[2]))
            points.append((int(trip_id), instance[0], instance[1], loc))

        
        cursor = conn.cursor()

        try:
            cursor.executemany(statement, points)
        except mdb.Error as e:
            print e
        conn.commit()
        print "%s records inserted for trip_id %s"%(len(points), trip_id)
        

    @classmethod
    def _run_baidu_api_privately(cls, company_id, conn):
        #Find all veh_trip_ids for this company
        all_trip_ids = generate_dict_from_sql('SELECT b.veh_trip_id FROM veh_reg_mark a, veh_trip b where a.company_id = %s and a.vrm_id=b.vrm_id ORDER BY b.veh_trip_id DESC'%company_id, conn)
        all_trip_ids = [ int(each.values()[0]) for each in all_trip_ids]

        #veh_trip alrdy in Baidu table
        baidu_id = generate_dict_from_sql("Select DISTINCT(veh_trip_id) FROM ui_baidu_snap_gps", conn)
        baidu_id = [int(each.values()[0]) for each in baidu_id]
 
        #last veh_trip_id in the last of each vrm_id
        last_id_full= generate_dict_from_sql("SELECT MAX(b.veh_trip_id) from veh_reg_mark a, veh_trip b where a.company_id = %s and a.vrm_id=b.vrm_id GROUP BY b.vrm_id"%company_id, conn)
        #last_id = [ int(x.values()[0]) for x in last_id ]
	last_id=[]
        print "last_id_full before checking the end time"
        print last_id_full

	for x in last_id_full: 
	    #print x 
	    last_trip_id =  x.values()[0]
            #Check if the trip is an old trip with points an hour ago
            sql_data = generate_dict_from_sql("SELECT UNIX_TIMESTAMP(end_time) as 'end_time' FROM veh_trip WHERE veh_trip_id = %s"%last_trip_id, conn)
            #print "The end time of the trip"
            #print sql_data
            #print sql_data[0]['end_time']
            #print time.time()
            time_diff = time.time()-int(sql_data[0]['end_time'])
            #print time_diff
            #time_difference_in_minutes = date_diff / timedelta(minutes=1)
            if time_diff <  60000 :
		        last_id.append(last_trip_id)
	            print "last_id list for last trip ID is not older than one hour"
	            print last_id


        #all veh_ids MINUS (ids alrdy in baidu table) MINUS (last ids of each vrm_id)
        trimmed_ids = [ x for x in all_trip_ids if x not in baidu_id and x not in last_id]

        for trip_id in trimmed_ids:
            trip_id = str(trip_id)

            #Baidu Api #1: Add entity
            from_Baidu.add_entity(trip_id)

            #Baidu Api #2: Add points for this entity
            if from_Baidu.add_points(conn=conn, veh_trip_id=trip_id, delay_between_calls=5) > 0 :
		return 

            #Baidu Api #3: Get the points from baidu
            result = from_Baidu.get_track(from_Baidu.start_time, from_Baidu.end_time, trip_id)
            
            from_Baidu.delete_entity(trip_id)
            
            #Insert onlentityy if it is not empty list
            if len(result) > 0:
                # print result
                cls.insert_into_baidu_db(conn, result, trip_id)
            elif  len(result) == 0:
		cls.insert_into_baidu_db(conn, result, trip_id)
		print " Insert one 0 records"%trip_id
		print result
	    else :
		print "result :" + result 
                print " Unable to insert empty list into db for %s"%trip_id

    @classmethod
    def update_baidu_table(cls, mins_break=20 * 60):
        while True:
            from config import company_id
            conn = connect_to_database(db_username, db_password, db_name, host)
            for company in company_id:
                cls._run_baidu_api_privately(company, conn)
            time.sleep(mins_break)



