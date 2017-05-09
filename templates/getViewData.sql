SELECT 
data#>>'{"attribute","name"}' variable,
data#>>'{"source","layerInfo","name"}' layer,
data#>>'{"source","layerInfo","maskName"}' mask
FROM mx_views 
WHERE id = '{{idView}}';
