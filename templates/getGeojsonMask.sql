  WITH bbox AS(
    SELECT !bbox_4326! {{geom}}
  ),
  mask as(
    SELECT ST_Buffer(ST_Collect(k.geom),0) geom
    FROM {{mask}} k, bbox b
    WHERE
    k.{{geom}} && b.{{geom}}
  ),
  main as(
    SELECT m.{{geom}}, {{attributes}}
    FROM  {{layer}} m, mask k, bbox b
    WHERE
    m.{{geom}} && b.{{geom}} AND 
    m.{{geom}} && k.{{geom}}
  ),
  overlap as (
    SELECT {{attributes}},
    CASE WHEN GeometryType(m.{{geom}}) != $$POINT$$
      THEN
      CASE 
      WHEN ST_CoveredBy(
        m.{{geom}},
        k.{{geom}}
      ) 
      THEN m.{{geom}} 
    ELSE
      ST_Multi(
        ST_Intersection(
          k.{{geom}},
          m.{{geom}}
        )
      )
END
ELSE
  m.{{geom}} END as {{geom}}
  FROM main m, mask k
  WHERE ST_Intersects(m.geom,k.geom)
)

SELECT ST_AsGeoJSON(
  -- ST_SimplifyPreserveTopology(
    {{geom}}
    -- , ( SELECT (1000/(512*2^({{zoom}}+1))) ) 
  -- )
    -- , 10 )
    ) as the_geom_geojson, {{attributes}}
FROM overlap o
