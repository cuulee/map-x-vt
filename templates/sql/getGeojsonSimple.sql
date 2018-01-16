SELECT ST_AsGeoJSON(
  ST_SimplifyPreserveTopology(
    {{geom}}
      , (SELECT (1e2/(512*2^{{zoom}})))
  )
  , 10 ) as the_geom_geojson, {{attributes}}
FROM {{layer}}
WHERE {{geom}} && !bbox_4326!
AND ST_Intersects( {{geom}}, !bbox_4326! )



