export default [
  {
    text: 'dashboard',
    icon: 'dashboard',
    routeName: 'dashboard'
  },
  // {
  //   text: 'users',
  //   icon: 'users',
  //   routeName: 'users'
  // },
  // {
  //   text: 'gauge',
  //   icon: 'gauge',
  //   routeName: 'gauge'
  // },
  // {
  //   text: 'plotly',
  //   icon: 'plotly',
  //   routeName: 'plotly'
  // },
  {
    text: 'map',
    icon: 'map',
    routeName: 'map'
  },
  {
    text: 'totalScoreAndAlert',
    icon: 'analysis',
    routeName: 'd2'
  },
  {
    text: 'driverScoreAndAlert',
    icon: 'Report2',
    routeName: 'report2'
  },
  {
    text: 'analysis',
    icon: 'analysis',
    routeName: 'd1'
  },
  {
    text: 'dataList',
    icon: 'unknown',
    children: [
      {
        text: 'dataListByVehicle',
        icon: 'analysis',
        routeName: 'analysis'
      },
      {
        text: 'dataListByGroup',
        icon: 'analysis',
        routeName: 'analysisGroup'
      },
    ]
  },
  {
    text: 'settings',
    icon: 'analysis',
    routeName: 'datatables'
  },
]
