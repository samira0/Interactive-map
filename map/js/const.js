const VISPARAM={
    index:{
        rrange:[1, 4],
        rRescaleFactor:2,
        rmin:0.25,
        runderflowOpacity:0.3,
        rregularOpacity:0.8,
        lt0Color:"#D50C0C",
        gt0Color:"#48D50C",
        strokeWidth:0
    },
    index100:{
        rrange:[1, 6],
        rRescaleFactor:2,
        rmin:0.25,
        runderflowOpacity:0,
        rregularOpacity:0.2,
        lt0Color:"#D50C0C",
        gt0Color:"#48D50C",
        strokeWidth: 0.1,
        strokeColor:"#D50C0C",
        fillColor:"#D50C0C"
    },
    value:{
        rrange:[1, 4],
        rRescaleFactor:2,
        rmin:0.25,
        runderflowOpacity:0.3,
        rregularOpacity:0.8,
        lt0Color:"#48D50C",
        gt0Color:"#D50C0C",
        colorScale:['#D50C0C','#48d50c'],
        strokeWidth:0
    },
    type:{
        colorSet:["#751818","#287828","#2525ff",
                    "#000000","#dfff39","#ec9bda","#6a286f"],
        rRescaleFactor:4,
        rmin:0.25,
        rregularOpacity:0.75
    },
    nodata:{
        r:0.45, rRescaleFactor:2,  rmin:0.25,
        strokeColor:"#b70cd5",
        fillColor:"#ddff00", strokeWidth: 0.2,
    },
    map:{
        borderColor:"#000",
        borderWidth:0.1,
        regionOpacity:0.8,
        regioinColor:"#cdbc62",
        mapInitialScale:900,
        txtInitialScaleLabel:0.45,
        txtMinSize:0.01
    }
}
