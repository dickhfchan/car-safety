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


CREATE TABLE `ui_baidu_snap_gps` (
  `baidu_gps_id` int(11) NOT NULL AUTO_INCREMENT,
  `veh_trip_id` int(11) DEFAULT NULL,
  `lat` double DEFAULT NULL,
  `lng` double DEFAULT NULL,
  `loc` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`baidu_gps_id`),
  UNIQUE KEY `baidu_gps_id_UNIQUE` (`baidu_gps_id`),
  KEY `veh_trip_id` (`veh_trip_id`,`baidu_gps_id`)
) ENGINE=InnoDB AUTO_INCREMENT=599044 DEFAULT CHARSET=utf8;


CREATE TABLE `gds_frontend`.`ui_fence_setup` (
  `fence_id` INT NOT NULL,
  `company_id` INT NULL,
  `created_by` INT NULL,
  `fence_baidu` JSON NULL,
  `fence` JSON NULL,
  `created_ts` TIMESTAMP NULL,
  PRIMARY KEY (`fence_id`));



# Modified to add the VRM_ID index only. Use the mysql admin tool 
CREATE index on table `veh_trip` (`vrm_id`)

            
           
ALTER TABLE `gds_frontend`.`user_account` 
ADD COLUMN `map` VARCHAR(20) NULL AFTER `version`;



CREATE 
    ALGORITHM = UNDEFINED 
    DEFINER = `root`@`localhost` 
    SQL SECURITY DEFINER
VIEW `v_avg_warning_vrm_grp_co` AS
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
        `a`.`fcw` AS `fcw`,
        `a`.`ufcw_h` AS `ufcw_h`,
        `a`.`ufcw_l` AS `ufcw_l`,
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
		    `b`.`grp_alias` AS `grp_alias`,
        `b`.`company_id` AS `company_id`
    FROM
        (`avg_warning_vrm_grp` `a`
        JOIN `veh_reg_mark_group` `b`)
    WHERE
        (`a`.`vrm_grp_id` = `b`.`vrm_grp_id`)
        
        
        
CREATE 
    ALGORITHM = UNDEFINED 
    DEFINER = `root`@`localhost` 
    SQL SECURITY DEFINER
VIEW `v_avg_warning_vrm_co` AS
    SELECT 
        `a`.`avg_warn_id` AS `avg_warn_id`,
        `a`.`vrm_id` AS `vrm_id`,
        `a`.`type` AS `type`,
        `a`.`start_date` AS `start_date`,
        `a`.`end_date` AS `end_date`,
        `a`.`drv_distance` AS `drv_distance`,
        `a`.`drv_duration` AS `drv_duration`,
        `a`.`idle_duration_trf` AS `idle_duration_trf`,
        `a`.`idle_duration_non_trf` AS `idle_duration_non_trf`,
        `a`.`fuel_usage` AS `fuel_usage`,
        `a`.`pcw` AS `pcw`,
        `a`.`fcw` AS `fcw`,
        `a`.`ufcw_h` AS `ufcw_h`,
        `a`.`ufcw_l` AS `ufcw_l`,        
        `a`.`vb` AS `vb`,
        `a`.`hmw_h` AS `hmw_h`,
        `a`.`hmw_m` AS `hmw_m`,
        `a`.`hmw_l` AS `hmw_l`,
        `a`.`lldw` AS `lldw`,
        `a`.`rldw` AS `rldw`,
        `a`.`spw` AS `spw`,
        `a`.`aaw` AS `aaw`,
        `a`.`abw` AS `abw`,
        `a`.`atw` AS `atw`,
        `a`.`create_ts` AS `create_ts`,
        `a`.`create_user` AS `create_user`,
        `a`.`version` AS `version`,
        `b`.`company_id` AS `company_id`,
        `b`.`vrm_mark_code` AS `vrm_mark_code`
    FROM
        ((`avg_warning_vrm` `a`
        JOIN `veh_reg_mark` `b`))
    WHERE
        ((`a`.`vrm_id` = `b`.`vrm_id`))
            


CREATE 
    ALGORITHM = UNDEFINED 
    DEFINER = `root`@`localhost` 
    SQL SECURITY DEFINER
VIEW `v_avg_warning_drv_name` AS
    SELECT 
        `b`.`company_id` AS `company_id`,
        `b`.`name` AS `name`,
        `a`.`avg_warn_id` AS `avg_warn_id`,
        `a`.`driver_id` AS `driver_id`,
        `a`.`type` AS `type`,
        `a`.`start_date` AS `start_date`,
        `a`.`end_date` AS `end_date`,
        `a`.`drv_distance` AS `drv_distance`,
        `a`.`drv_duration` AS `drv_duration`,
        `a`.`idle_duration_trf` AS `idle_duration_trf`,
        `a`.`idle_duration_non_trf` AS `idle_duration_non_trf`,
        `a`.`fuel_usage` AS `fuel_usage`,
        `a`.`pcw` AS `pcw`,
        `a`.`fcw` AS `fcw`,
        `a`.`ufcw_h` AS `ufcw_h`,
        `a`.`ufcw_l` AS `ufcw_l`,
        `a`.`vb` AS `vb`,
        `a`.`hmw_h` AS `hmw_h`,
        `a`.`hmw_m` AS `hmw_m`,
        `a`.`hmw_l` AS `hmw_l`,
        `a`.`lldw` AS `lldw`,
        `a`.`rldw` AS `rldw`,
        `a`.`spw` AS `spw`,
        `a`.`aaw` AS `aaw`,
        `a`.`abw` AS `abw`,
        `a`.`atw` AS `atw`,
        `a`.`create_ts` AS `create_ts`,
        `a`.`create_user` AS `create_user`,
        `a`.`version` AS `version`
    FROM
        (`avg_warning_drv` `a`
        JOIN `driver` `b`)
    WHERE
        (`a`.`driver_id` = `b`.`driver_id`)
        
        
       
