from flask import Flask, jsonify
from flask_restful import Resource, Api, reqparse
from datetime import datetime
import pandas as pd
#Self-defined modules:
from middleware import retrieve_table, clean_veh_trip_table, retrieve_json_from_google, check_veh_trip_id, generate_dict_from_sql, insert_into_google_table
from middleware import connect_to_database
from config import db_name, db_password, db_username, host, port


app = Flask(__name__)
api = Api(app)
#cnxpool = MySQLConnectionPool(pool_name="GreenSafety", database=db_name,user=db_username, password=db_password, pool_size=7)
conn = connect_to_database(db_username, db_password, db_name)

default_headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods':'GET,POST,PUT,PATCH,DELETE,OPTIONS'}

table_routes = [
    '/api/dao/<string:table_name>',
    '/api/dao/<string:table_name>/<int:key>'
]

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

        elif table_name == 'log_data':
            ##Log_data table: please add <start_date> and <end_date> in query string
            #Locate start_time and end_time args in querystring
            parser = reqparse.RequestParser()
            parser.add_argument('start_time', required=True, type= lambda x: datetime.strptime(str(x).decode('utf-8'), "%Y-%m-%d %H:%M:%S"), location='args')
            parser.add_argument('end_time', required=True, type= lambda x: datetime.strptime(str(x).decode('utf-8'), "%Y-%m-%d %H:%M:%S"), location='args')
            args = parser.parse_args()
            start_time = args.get('start_time')
            end_time = args.get('end_time')

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


@app.route('/')
def index():
    return "Hello_World"

api.add_resource(Tables_JSON, *table_routes)
api.add_resource(Google_JSON, '/api/google/<int:veh_trip_id>')

if __name__ == '__main__':
    app.run(host='0.0.0.0',port=8080, debug=True)
