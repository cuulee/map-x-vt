SELECT 
*
FROM mx_views
WHERE id = '{{idView}}'
ORDER BY date_modified DESC
LIMIT 1
