from config import API_KEY
from middleware import connect_to_database
import requests

def retrieve_json_from_google(coordinates, API_KEY=API_KEY):
    #Turn the dataframe into numpy array of lat/lng pairs
    long_lat_values = coordinates
    length = len(long_lat_values)
    #print long_lat_values
    #print length


    print "Breaking lat/lng into 100 pairs per chunk for Google API"
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

    #print chunks

    print "GOOGLE API Feeding"
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
	    #print "print results"
            #print results

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

    #print "Smoothened Data"
    #print smoothened_data

    if len(smoothened_data) == 0: message = "Google Snap API did not return any values"
    else: message ="GOOGLE API SUCCESS, %s data returned"% len(smoothened_data)

    return smoothened_data, message

class GoogleMapCronJobs(object):

    @staticmethod
    def insert_into_google_db(conn, instances, trip_id):
        statement = "INSERT INTO google_snap_gps (veh_trip_id, lat, lng, originalIndex, placeId) VALUES (%s, %s, %s, %s, %s)"
        points = []
        for instance in instances:
            points.append((int(trip_id), instance['location']['latitude'], instance['location']['longitude'], instance['originalIndex'], instance['placeId']))


        cursor = conn.cursor()

        try:
            cursor.executemany(statement, points)
        except mdb.Error as e:
            print e
        conn.commit()
        print "%s records inserted for trip_id %s"%(len(points), trip_id)


    @classmethod
    def _run_google_api_privately(cls, company_id, conn):
        #Find all veh_trip_ids for this company
        all_trip_ids = generate_dict_from_sql('SELECT b.veh_trip_id FROM veh_reg_mark a, veh_trip b where a.company_id = %s and a.vrm_id=b.vrm_id ORDER BY b.veh_trip_id DESC'%company_id, conn)
        all_trip_ids = [ int(each.values()[0]) for each in all_trip_ids]

        #veh_trip alrdy in Google table
        google_id = generate_dict_from_sql("Select DISTINCT(veh_trip_id) FROM google_snap_gps", conn)
        google_id = [int(each.values()[0]) for each in google_id]

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
        trimmed_ids = [ x for x in all_trip_ids if x not in google_id and x not in last_id]

        for trip_id in trimmed_ids:
            trip_id = str(trip_id)
            # select coordinates from veh_trip_detail
            result = generate_dict_from_sql("SELECT unix_timestamp(time) as time,lat,lng FROM veh_trip_detail WHERE veh_trip_id = %s AND lat <> 0 AND lng <> 0 ORDER BY seq_no"%trip_id, conn)
            # change format
            result = [(each['lat'], each['lng']) for each in result]

            #Insert onlentityy if it is not empty list
            if len(result) > 0:
                # print result
                cls.insert_into_google_db(conn, result, trip_id)
            elif  len(result) == 0:
		cls.insert_into_google_db(conn, result, trip_id)
		print " Insert one 0 records"%trip_id
		print result
	    else :
		print "result :" + result
                print " Unable to insert empty list into db for %s"%trip_id

    @classmethod
    def update_google_table(cls, mins_break=20 * 60):
        while True:
            from config import company_id
            conn = connect_to_database(db_username, db_password, db_name, host)
            for company in company_id:
                cls._run_google_api_privately(company, conn)
            time.sleep(mins_break)

GoogleMapCronJobs.update_google_table()
