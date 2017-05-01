##### ak: 0WbyzDGMdtHjqr2rW4EZ1HGrKb2vdbpG
##### servece id: 139574
# entry
http://lbsyun.baidu.com/index.php?title=yingyan/api/v3/entity
## add entry
~~~js
url: http://yingyan.baidu.com/api/v3/entity/add  
method: post  
body: {
  ak,
  servece_id,
  entry_name
}
result: {
  status, // 0: success
  message,
}
~~~

## update entry
~~~js
url: http://yingyan.baidu.com/api/v3/entity/update  
method: post  
body: {
  ak,
  servece_id,
  entry_name
}
result: {
  status, // 0: success
  message,
}
~~~

## delete entry
~~~js
url: http://yingyan.baidu.com/api/v3/entity/delete  
method: post  
body: {
  ak,
  servece_id,
  entry_name
}
result: {
  status, // 0: success
  message,
}
~~~

## list entries
~~~js
...
~~~

# upload coordinates
## add points
~~~js
url: http://yingyan.baidu.com/api/v3/track/addpoints
method: post
example body: {
  ak,
  servece_id,
  point_list: [
   {
       "entity_name": "entity1",
       "loc_time": 123,
       "latitude": 23.34,
       "longitude": 134.43,
       "coord_type_input": "wgs84",
       "speed":27.23,
       "direction":178,
       "height":173.3,
       "radius":32,
       "object_name":"12836",
       "city": "guangzhou",
       "province": "guangdong",
   },
   {
       "entity_name": "entity2",
       "loc_time": "321",
       "latitude": "23.34",
       "longitude": "135.43",
       "coord_type_input": "wgs84",
       "speed" :28.82,
       "direction":174,
       "height":173.6,
       "radius":32,
       "object_name":"12837",
       "city": "guangzhou",
       "province": "guangdong"
   }
 ]
}
~~~

# get snapped points
```js
url: http://yingyan.baidu.com/api/v3/track/gettrack
method: get
query: {
  ak,
  servece_id,
  entry_name,
  start_time,
  end_time,
  is_processed: 1, // get snapped points
  process_option: 'need_denoise=1,need_vacuate=1,need_mapmatch=1,transport_mode=driving',
  coord_type_output: 'bd09ll',
  page_index: 1,
  page_size: 5000
}
example result: {
 "status": 0,
 "message": "成功",
 "total": 10156,
 "size": 100,
 "distance": 70101.769271664,
 "toll_distance": 0,
 "start_point": {
   "longitude": 121.47756835641,
   "latitude": 31.228864478309,
   "loc_time": 1487210008
 },
 "end_point": {
   "longitude": 121.66034736775,
   "latitude": 31.145494901873,
   "loc_time": 1487260798
 },
 "points": [
   {
     "loc_time": 1487210008,
     "latitude": 31.228864478309,
     "longitude": 121.47756835641,
     "create_time": "2017-02-16 09:53:56",
     "direction": 160,
     "height": 5,
     "key1": "value1",
     "radius": 30,
     "speed": 6.8
   },
   {
     "loc_time": 1487210013,
     "latitude": 31.228900948179,
     "longitude": 121.47727614458,
     "create_time": "2017-02-16 09:53:56",
     "direction": 0,
     "height": 36,
     "key1": "value1",
     "radius": 10,
     "speed": 0
   },
   ...
   {
     "loc_time": 1487210503,
     "latitude": 31.232230380323,
     "longitude": 121.47848441484,
     "create_time": "2017-02-16 10:02:09",
     "direction": 228,
     "height": 6,
     "key1": "value1",
     "radius": 30,
     "speed": 1.87
   }
}
```
