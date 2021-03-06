from flask import Flask, jsonify, request, Response
from flask_restful import Resource, Api, reqparse
from datetime import datetime, timedelta
import pandas as pd
import MySQLdb as mdb
import time
import json as json_obj
from flask_restful.utils import cors

#Self-defined modules:
from middleware import retrieve_table, clean_veh_trip_table, retrieve_json_from_google, check_veh_trip_id, generate_dict_from_sql, insert_into_google_table
from middleware import connect_to_database
from config import db_name, db_password, db_username, host, port
from middleware import from_Baidu, CronJobs

# mongo video
from pymongo import MongoClient

app = Flask(__name__)
api = Api(app)


#cnxpool = MySQLConnectionPool(pool_name="GreenSafety", database=db_name,user=db_username, password=db_password, pool_size=7)
conn = connect_to_database(db_username, db_password, db_name, host, port)
#print "Make connection to DB"
#print conn

default_headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods':'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Connection, User-Agent, Cookie'
    }

table_routes = [
    '/api/dao/<string:table_name>',
    '/api/dao/<string:table_name>/<int:key>',
    '/api/dao/<string:table_name>/<string:key>'
]


#Store the primary key of each table as key:value pairs
primary_keys = {
    'company' : 'company_id',
    'driver' : 'driver_id',
    'driver_group' : 'drv_grp_id',
    'driver_group_dtl' : 'drv_grp_dtl_id',
    'mob_device' : 'md_id',
    'user_account' : 'user_id',
    'user_group' : 'group_id',
    'user_group_func' : 'group_func_id',
    'users' : 'id',
    'vehicle' : 'vehicle_id',
    'veh_reg_mark' : 'vrm_id',
    'veh_reg_mark_group' : 'vrm_grp_id',
    'veh_reg_mark_group_dtl' : 'vrm_grp_dtl_id',
    'warning_type' : 'warn_type_id',
    'authentication' : 'username',
    'ui_geofence_setup' : 'geofence_id'
}

#Create datatime columns

dt_columns = ['create_ts','start_date', 'end_date', 'update_ts', 'last_loc_update_ts', 'apps_ts', 'last_access_ts', 'last_login_ts']


class Google_JSON(Resource):
    def get(self, veh_trip_id):

        conn = connect_to_database(db_username, db_password, db_name, host, port)
        print "Make connection to DB in Google_Json Class"

        id_Exist = check_veh_trip_id(conn, veh_trip_id)

        if id_Exist:
            # If id is found, return the data from google_snap_gps table
            query = "SELECT * FROM google_snap_gps WHERE veh_trip_id = %s" % veh_trip_id
            json = generate_dict_from_sql(query, conn)
            json = [{'location':{'latitude': x['lat'], 'longitude': x['lng']}, 'originalIndex':x['originalIndex'], 'placeId':x['placeId']} for x in json]
            message = "%s records retrieved from google_snap_gps"% len(json)

            #Close conncetion
            print "Close connection in id_Exist is true"
            conn.close()

            def simplify(item):
                return [item['location']['latitude'], item['location']['longitude'], item.get('originalIndex')]

            return {"message": message, 'JSON': map(simplify, json)}, 200, default_headers

        else:
            # if id is not found, prepare data for GOOGLE API, message can be printed for troubleshoot purpose
            table, message = clean_veh_trip_table(conn, veh_trip_id)
            #print message
            if table is None:
                # veh_trip_id doesnt exist on veh_trip_detail, return empty list

		results = json_obj.loads('[{"location": {"latitude": 0,"longitude": 0},"originalIndex": 0,"placeId": "0"}]')
		insert_into_google_table(conn, results, veh_trip_id)

                #Close conncetion
                print "Close connection in id_Exist is not true"
                conn.close()

                return {'message': message, 'JSON': []}, 200, default_headers

            results, message = retrieve_json_from_google(table)
            if "GOOGLE API SUCCESS" in message:
                print "All chunks passed through GOOGLE API and returned successfully"
	        #print results
                # Don't insert intot the Google GPS table as the trip is confirmed to be completed.
		#insert_into_google_table(conn, results, veh_trip_id)

                #Close conncetion
                print "Close connection"
                conn.close()

                def simplify(item):
                    return [item['location']['latitude'], item['location']['longitude'], item.get('originalIndex')]
                return {'message': message, 'JSON': map(simplify, results)}, 200, default_headers

            else:
                print "Possible errors: Daily limit reached, GOOGLE API did not return anything (faulty gps values)"
	        print "Insert a row with 0 values for trip: " + str(veh_trip_id)

                #results = '{"snappedPoints": [{"location": {"latitude": 0,"longitude": 0},"originalIndex": 0,"placeId": "0"}]}'
		results = json_obj.loads('[{"location": {"latitude": 0,"longitude": 0},"originalIndex": 0,"placeId": "0"}]')
                print(type(results))
		print results
                insert_into_google_table(conn, results, veh_trip_id)

                #Close conncetion
                print "Close connection"
                conn.close()

                return {'message': message, 'JSON': []}, 200, default_headers



class Baidu_API(Resource):
    def get(self, veh_trip_id):

        conn = connect_to_database(db_username, db_password, db_name, host, port)
        print "Make connection to DB in Class"

        #return in the form of (lat, lng, )
        exist, points = from_Baidu.check_exist(veh_trip_id, conn)
        if exist:

            #Close conncetion
            print "Close connection"
            conn.close()

            #return {"JSON": points}
            return {'message': "From database table", 'JSON': points}, 200, default_headers

        else:
            table, message = clean_veh_trip_table(conn, veh_trip_id)
            print "Baidu api for unsmoothened GPS points"
            #print table
            statement = table.to_dict(orient='record')

	    #print statement

            statement = [(each['lat'], each['lng'], int(each['time']) ) for each in statement]
            #print statement

	    return {'message': "No track info in Baidu table but return unsmoothened GPS points", 'JSON': statement}, 200, default_headers


class Tables_JSON(Resource):
    def get(self,table_name, key=None):


        conn = connect_to_database(db_username, db_password, db_name, host, port)
        print "Make connection to DB in Class"

        # "veh_trip_detail" or "veh_trip"
        if table_name in ["veh_trip_detail", "veh_trip", "veh_trip_by_driver"]:

            if key is not None:
                ## Validation for key
                results, message = retrieve_table([table_name, key], conn, json_format=True)

                #Close conncetion
                print "Close connection"
                conn.close()

                return {'message': message, 'JSON': results}, 200, default_headers

            else:
                ##Validation error
                return {'message': message, 'JSON': []}, 400

        elif table_name == 'authentication':
            print reqparse.RequestParser()
            parser = reqparse.RequestParser()
            parser.add_argument('password', type=str)
            parser.add_argument('company_code', type=str)
            args = parser.parse_args()
            print "password and user name"
            password =  args.get('password')
            company_code = args.get('company_code')
            print company_code
            print key

            if key is not None and password is not None:


                results, message = retrieve_table([table_name, key, password, company_code], conn, json_format=True)

        	#Close conncetion
        	print "Close connection"
        	conn.close()

                return {'message': message,'JSON': results}, 200, default_headers
            else:
                return {'message':'please check your key, password', 'JSON':[]}, 400,{'message': "Check your query string"}

        elif table_name == 'log_data':
            ##Log_data table: please add <start_date> and <end_date> in query string
            #Locate start_time and end_time args in querystring
            parser = reqparse.RequestParser()
            parser.add_argument('start_time', required=True, type= lambda x: datetime.strptime(str(x).decode('utf-8'), "%Y-%m-%d %H:%M:%S"), location='args')
            parser.add_argument('end_time', required=True, type= lambda x: datetime.strptime(str(x).decode('utf-8'), "%Y-%m-%d %H:%M:%S"), location='args')
            args = parser.parse_args()
            start_time = args.get('start_time')
            end_time = args.get('end_time')

	    print key
            print start_time
	    print end_time

            if key is not None and type(start_time) is datetime and type(end_time) is datetime:
                ##Validation for key, start_time and end_time
                results, message = retrieve_table([table_name, key, start_time, end_time], conn, json_format=True)

                #Close conncetion
                print "Close connection"
                conn.close()

                return {'message': message,'JSON': results}, 200, default_headers
            else:
                #Validation failed:
                return {'message':'please check your key, start_time and end_time', 'JSON':[]}, 400,{'message': "Check your query string for start_time and end_time and key"}

	elif table_name in ['avg_warning_vrm_by_co_type_date', 'avg_warning_drv_by_co_type_date']:
	    print "Enter the avg_warning API"
            print reqparse.RequestParser()
            parser = reqparse.RequestParser()
            parser.add_argument('type', type=str)
            parser.add_argument('start_date', type=str)
            parser.add_argument('end_date', type=str)
            args = parser.parse_args()
            type_range  =  args.get('type')
	    print "Printing the arg from the API"
	    print key
            print type_range
            start_date = args.get('start_date')
	    print start_date
	    end_date = args.get('end_date')
	    print end_date

            if key is not None and type_range is not None and start_date is not None and end_date is not None:


                results, message = retrieve_table([table_name, key, type_range, start_date, end_date], conn, json_format=True)

                #Close conncetion
                print "Close connection"
                conn.close()

                return {'message': message,'JSON': results}, 200, default_headers
            else:
                return {'message':'please check your key, type_range, start_date and end_date', 'JSON':[]}, 400,{'message': "Check your query string"}



        ## Other tables
        else:
            results, message = retrieve_table([table_name], conn, json_format=True)

            #Close conncetion
            print "Close connection"
            conn.close()

            return {'message': message,'JSON': results}, 200, default_headers



    # Handle POST event for an insertion/Update event:
    # User must set "Content-Type" to "application/json" in POST request
    # Use table attributes given in MySQL schema for JSON keys
    @cors.crossdomain(origin='*')
    def post(self, table_name, key=None):

        conn = connect_to_database(db_username, db_password, db_name, host, port)
        print "Make connection to Post event for insert / udpate"
	print self
        print table_name
        print key


        #check if table is one of those listed in "primary_keys"
        if primary_keys.has_key(table_name):
            json = request.get_json()
	    print json

            if json is None:

            	#Close conncetion
            	print "Close connection"
            	conn.close()

                return "No JSON object captured", 200, default_headers

            pk_name = primary_keys[table_name]
            columns = json.keys()

            #Check if Primary Key is given in JSON
            try:
                pk_value = json[pk_name]
            except KeyError:
                #Close conncetion
                print "Close connection"
                conn.close()

                return "Key %s is not in JSON" % pk_name, 200, default_headers

            #Datetime clean up:
            #Convert unix time to UTC time for safe insertion into database
            if any(col in dt_columns for col in columns):
                for each in dt_columns:
                    if json.has_key(each):
                        json[each] = datetime.fromtimestamp(json[each]).strftime('%Y-%m-%d %H:%M:%S')
                    else:
                        continue

            #Query database if this pk alrdy exists
            _dict = generate_dict_from_sql("SELECT * FROM %s WHERE %s = %s"%(table_name, pk_name, pk_value), conn, False)

            #Perform Insertion if primary key doesnt exist on table
            if not _dict:

                placeholders = ("%s,"*len(columns))[:-1]
                columns = ",".join(columns)
                values = tuple(json.values())
                sql = "INSERT INTO %s (%s) VALUES (%s)"%(table_name, columns, placeholders)
                print sql

                cursor = conn.cursor()
                try:
                    cursor.execute(sql,values)
                except mdb.Error as e:
		    #Close conncetion
            	    print "Close connection"
                    conn.close()

                    return e[1]

                conn.commit()
                cursor.close()

           	#Close conncetion
            	print "Close connection"
            	conn.close()

                return "%s %s successfully added to %s table"%(pk_name, pk_value, table_name), 200, default_headers

            #Perform Update if the pk alrdy exists
            else:

        	conn = connect_to_database(db_username, db_password, db_name, host, port)
        	print "Make connection to Post event for insert / udpate"

                sql = "UPDATE %s SET %s WHERE %s = %s"

                placeholders = ""
                for k,v in json.items():
                    if type(v) is str or type(v) is unicode:
                        placeholders += "%s = '%s',"%(k,v)
                    else:
                        placeholders += "%s = %s,"%(k,v)

                #Construct Update statement
                sql = sql%(table_name, placeholders[:-1], pk_name, pk_value)

                print sql

                cursor = conn.cursor()
                try:
                    cursor.execute(sql)
                except mdb.Error as e:
                    #Close conncetion
                    print "Close connection"
                    conn.close()

	            return e[1]

                conn.commit()
                cursor.close()

                #Close conncetion
                print "Close connection"
                conn.close()
                return "Successfully Updated PK %s in table %s"%(pk_value, table_name), 200, default_headers
        else:

            #Close conncetion
            print "Close connection"
            conn.close()

            return "POST request denied for this table %s"%(table_name), 200, default_headers


    # Handle DELETE event for an insertion/Update event:
    # User must set "Content-Type" to "application/json" in POST request
    # Use table attributes given in MySQL schema for JSON keys
    def delete(self, table_name, key=None):
        conn = connect_to_database(db_username, db_password, db_name, host, port)
        print "Make connection to Post event for insert / udpate"

        if primary_keys.has_key(table_name):
            json = request.get_json()
            if json is None:
            	#Close conncetion
            	print "Close connection"
            	conn.close()
		return "No JSON object captured", 200, default_headers

            pk_name = primary_keys[table_name]
            columns = json.keys()

            #Check if Primary Key is given in JSON
            try:
                pk_value = json[pk_name]
            except KeyError:
                #Close conncetion
                print "Close connection"
                conn.close()

                return "Key %s is not in JSON" % pk_name, 200, default_headers

            cursor = conn.cursor()
            sql = "DELETE FROM %s WHERE %s=%s"%(table_name, pk_name, pk_value)

            try:
                cursor.execute(sql)
            except mdb.Error as e:
            	#Close conncetion
            	print "Close connection"
            	conn.close()

                return e[1]

            conn.commit()
            cursor.close()
	    conn.close()
            return "PK %s successfully removed from table %s"%(pk_value, table_name), 200, default_headers

        else:
            return "DELETE request denied for this table %s" % table_name, 200, default_headers

    def options(self, table_name, key=None):
        print default_headers
        return '', 200, default_headers


class video(Resource):
    def get(self, video_id):
	print "Entered video class"
        client = MongoClient('dgdsvdodb01:27017')
        client.warning_video.authenticate('gds_ui', 'GDS_ui_322', mechanism='SCRAM-SHA-1')
        db = client.warning_video
        chunks = db.warning_video_chunk.find( { "videoId" : video_id}, { "payload" : 1} ).sort([ ("chunkNum", 1) ])
        result = ''

	#out = open('./test062301.mp4', 'wb')

        for chunk in chunks:
	    print "Get one chunk"
            result += chunk['payload']
	    #out.write(chunk['payload'])
	#out.close()
        return Response(result, mimetype='application/octet-stream')

@app.route('/')
def index():
    return "Hello_World"

api.add_resource(Tables_JSON, *table_routes)
api.add_resource(Google_JSON, '/api/google/<int:veh_trip_id>')
api.add_resource(Baidu_API, '/api/baidu/<int:veh_trip_id>')
api.add_resource(video, '/api/video/<video_id>')

if __name__ == '__main__':
    app.run(host='0.0.0.0',port=8081, debug=True, threaded=True)
