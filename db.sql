CREATE TABLE `google_snap_gps` (
  `google_snap_gsp_id` int(11) NOT NULL AUTO_INCREMENT,
  `veh_trip_id` int(11) DEFAULT NULL,
  `lat` double DEFAULT NULL,
  `lng` double DEFAULT NULL,
  `originalIndex` int(11) DEFAULT NULL,
  `placeId` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`google_snap_gsp_id`),
  UNIQUE KEY `google_snap_gsp_id_UNIQUE` (`google_snap_gsp_id`),
  KEY `veh_trip_id` (`veh_trip_id`,`google_snap_gsp_id`)
) ENGINE=InnoDB AUTO_INCREMENT=525918 DEFAULT CHARSET=latin1;


# Modified to add the VRM_ID index only.
CREATE TABLE `veh_trip` (
  `veh_trip_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `vrm_id` int(10) unsigned NOT NULL,
  `driver_id` int(10) unsigned DEFAULT NULL,
  `start_time` timestamp NULL DEFAULT NULL,
  `end_time` timestamp NULL DEFAULT NULL,
  `drv_distance` int(10) DEFAULT NULL,
  `drv_duration` int(10) DEFAULT NULL,
  `create_ts` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `create_user` varchar(20) DEFAULT NULL,
  `update_ts` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_user` varchar(20) DEFAULT NULL,
  `version` smallint(5) unsigned NOT NULL,
  PRIMARY KEY (`veh_trip_id`),
  KEY `idx_veh_trip_vrm_id` (`vrm_id`)
) ENGINE=InnoDB AUTO_INCREMENT=28105 DEFAULT CHARSET=utf8;
