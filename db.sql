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



CREATE 
    ALGORITHM = UNDEFINED 
    DEFINER = `root`@`localhost` 
    SQL SECURITY DEFINER
VIEW `warning_vrm_grp_co` AS
    SELECT 
        `a`.`avg_warn_id` AS `avg_warn_id`,
        `a`.`vrm_grp_id` AS `vrm_grp_id`,
        `a`.`type` AS `type`,
        `a`.`start_date` AS `start_date`,
        `a`.`end_date` AS `end_date`,
        `a`.`drv_distance` AS `drv_distance`,
        `a`.`drv_duration` AS `drv_duration`,
        `a`.`idle_duration_trf` AS `idle_duration_trf`,
        `a`.`idle_duration_non_trf` AS `idle_duration_non_trf`,
        `a`.`fuel_usage` AS `fuel_usage`,
        `a`.`total_score` AS `total_score`,
        `a`.`fcw_score` AS `fcw_score`,
        `a`.`ufcw_score` AS `ufcw_score`,
        `a`.`vb_score` AS `vb_score`,
        `a`.`hmw_h_score` AS `hmw_h_score`,
        `a`.`hmw_m_score` AS `hmw_m_score`,
        `a`.`hmw_l_score` AS `hmw_l_score`,
        `a`.`pcw_score` AS `pcw_score`,
        `a`.`lldw_score` AS `lldw_score`,
        `a`.`rldw_score` AS `rldw_score`,
        `a`.`spw_score` AS `spw_score`,
        `a`.`aaw_score` AS `aaw_score`,
        `a`.`abw_score` AS `abw_score`,
        `a`.`atw_score` AS `atw_score`,
        `a`.`fcw` AS `fcw`,
        `a`.`ufcw` AS `ufcw`,
        `a`.`vb` AS `vb`,
        `a`.`hmw_h` AS `hmw_h`,
        `a`.`hmw_m` AS `hmw_m`,
        `a`.`hmw_l` AS `hmw_l`,
        `a`.`pcw` AS `pcw`,
        `a`.`lldw` AS `lldw`,
        `a`.`rldw` AS `rldw`,
        `a`.`spw` AS `spw`,
        `a`.`aaw` AS `aaw`,
        `a`.`abw` AS `abw`,
        `a`.`atw` AS `atw`,
        `a`.`create_ts` AS `create_ts`,
        `a`.`create_user` AS `create_user`,
        `a`.`version` AS `version`,
        `b`.`company_id` AS `company_id`
    FROM
        (`avg_warning_vrm_grp` `a`
        JOIN `veh_reg_mark_group` `b`)
    WHERE
        (`a`.`vrm_grp_id` = `b`.`vrm_grp_id`)
