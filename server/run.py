
from flask import Flask, jsonify, request
from flask_restful import Resource, Api, reqparse
from datetime import datetime, timedelta
import pandas as pd
import MySQLdb as mdb
import time

#Self-defined modules:
from middleware import retrieve_table, clean_veh_trip_table, retrieve_json_from_google, check_veh_trip_id, generate_dict_from_sql, insert_into_google_table
from middleware import connect_to_database
from config import db_name, db_password, db_username, host, port
from middleware import from_Baidu



app = Flask(__name__)
api = Api(app)
#cnxpool = MySQLConnectionPool(pool_name="GreenSafety", database=db_name,user=db_username, password=db_password, pool_size=7)
conn = connect_to_database(db_username, db_password, db_name, host, port)

default_headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods':'GET,POST,PUT,PATCH,DELETE,OPTIONS'}

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
    'driver_group_dtl' : 'drv_group_dtl_id',
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
    'authentication' : 'username'
}

#Create datatime columns
dt_columns = ['create_ts','start_date', 'end_date', 'update_ts', 'last_loc_update_ts', 'apps_ts', 'last_access_ts']


class Google_JSON(Resource):
    def get(self, veh_trip_id):

        id_Exist = check_veh_trip_id(conn, veh_trip_id)

        if id_Exist:
            # If id is found, return the data from google_snap_gps table
            query = "SELECT * FROM google_snap_gps WHERE veh_trip_id = %s" % veh_trip_id
            json = generate_dict_from_sql(query, conn)
            json = [{'location':{'latitude': x['lat'], 'longitude': x['lng']}, 'originalIndex':x['originalIndex'], 'placeId':x['placeId']} for x in json]
            message = "%s records retrieved from google_snap_gps"% len(json)
            return {"message": message, 'JSON': json}, 200, default_headers

        else:
            # if id is not found, prepare data for GOOGLE API, message can be printed for troubleshoot purpose
            table, message = clean_veh_trip_table(conn, veh_trip_id)
            #print message
            if table is None:
                # veh_trip_id doesnt exist on veh_trip_detail, return empty list
                return {'message': message, 'JSON': []}, 200, default_headers

            results, message = retrieve_json_from_google(table)
            if "GOOGLE API SUCCESS" in message:
                # All chunks passed through GOOGLE API and returned successfully
                insert_into_google_table(conn, results, veh_trip_id)
                return {'message': message, 'JSON': results}, 200, default_headers
            else:
                # Possible errors: Daily limit reached, GOOGLE API did not return anything (faulty gps values)
                return {'message': message, 'JSON': []}, 200, default_headers



class Baidu_API(Resource):
    def get(self, veh_trip_id):
        veh_id = str(veh_trip_id)
        from_Baidu.add_entity(veh_id)
        from_Baidu.add_points(conn=conn, veh_trip_id=veh_id,delay_between_calls=5)
        result = from_Baidu.get_track(from_Baidu.start_time, from_Baidu.end_time, veh_id)
        if type(result) is dict:
            from_Baidu.delete_entity(veh_id)
            return {"JSON": [result]}
        else:
            return {"JSON": []}



class Tables_JSON(Resource):
    def get(self,table_name, key=None):
        # "veh_trip_detail" or "veh_trip"
        if table_name in ["veh_trip_detail", "veh_trip"]:

            if key is not None:
                ## Validation for key
                results, message = retrieve_table([table_name, key], conn, json_format=True)
                return {'message': message, 'JSON': results}, 200, default_headers
            else:
                ##Validation error
                return {'message': message, 'JSON': []}, 400

        elif table_name == 'authentication':
            print reqparse.RequestParser()
            parser = reqparse.RequestParser()
            parser.add_argument('password', type=str)
            args = parser.parse_args()
            print "password and user name"
            password =  args.get('password')
            print key

            if key is not None and password is not None:
                results, message = retrieve_table([table_name, key, password], conn, json_format=True)
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
	        # print start_time
	        # start_time = start_time - timedelta(hours=8)
	        # print start_time
            end_time   = end_time - timedelta(hours=8)

            if key is not None and type(start_time) is datetime and type(end_time) is datetime:
                ##Validation for key, start_time and end_time
                results, message = retrieve_table([table_name, key, start_time, end_time], conn, json_format=True)
                return {'message': message,'JSON': results}, 200, default_headers
            else:
                #Validation failed:
                return {'message':'please check your key, start_time and end_time', 'JSON':[]}, 400,{'message': "Check your query string for start_time and end_time and key"}


        ## Other tables
        else:
            results, message = retrieve_table([table_name], conn, json_format=True)
            return {'message': message,'JSON': results}, 200, default_headers


    # Handle POST event for an insertion/Update event:
    # User must set "Content-Type" to "application/json" in POST request
    # Use table attributes given in MySQL schema for JSON keys
    def post(self, table_name, key=None):
        #check if table is one of those listed in "primary_keys"
        if primary_keys.has_key(table_name):
            json = request.get_json()

            if json is None:
                return "No JSON object captured", 200, default_headers

            pk_name = primary_keys[table_name]
            columns = json.keys()

            #Check if Primary Key is given in JSON
            try:
                pk_value = json[pk_name]
            except KeyError:
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
                    return e[1]
                conn.commit()
                cursor.close()
                return "%s %s successfully added to %s table"%(pk_name, pk_value, table_name), 200, default_headers

            #Perform Update if the pk alrdy exists
            else:

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
                    return e[1]
                conn.commit()
                cursor.close()
                return "Successfully Updated PK %s in table %s"%(pk_value, table_name), 200, default_headers
        else:
            return "POST request denied for this table %s"%(table_name), 200, default_headers


    # Handle DELETE event for an insertion/Update event:
    # User must set "Content-Type" to "application/json" in POST request
    # Use table attributes given in MySQL schema for JSON keys
    def delete(self, table_name, key=None):
        if primary_keys.has_key(table_name):
            json = request.get_json()
            if json is None:
                return "No JSON object captured", 200, default_headers

            pk_name = primary_keys[table_name]
            columns = json.keys()

            #Check if Primary Key is given in JSON
            try:
                pk_value = json[pk_name]
            except KeyError:
                return "Key %s is not in JSON" % pk_name, 200, default_headers

            cursor = conn.cursor()
            sql = "DELETE FROM %s WHERE %s=%s"%(table_name, pk_name, pk_value)

            try:
                cursor.execute(sql)
            except mdb.Error as e:
                return e[1]
            conn.commit()
            cursor.close()
            return "PK %s successfully removed from table %s"%(pk_value, table_name), 200, default_headers

        else:
            return "DELETE request denied for this table %s" % table_name, 200, default_headers




@app.route('/')
def index():
    return "Hello_World"

api.add_resource(Tables_JSON, *table_routes)
api.add_resource(Google_JSON, '/api/google/<int:veh_trip_id>')
api.add_resource(Baidu_API, '/api/baidu/<int:veh_trip_id>')

if __name__ == '__main__':
    app.run(host='0.0.0.0',port=8081, debug=True)
