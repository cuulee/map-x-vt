SELECT 
EXISTS(
SELECT
  1
  FROM mx_users
  WHERE 
  id = {{idUser}} AND
  data #>>'{"admin","token"}' = '{{token}}'
  LIMIT 1
)
as valid
