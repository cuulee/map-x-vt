SELECT 
data#>>'{"attribute","name"}' variable,
data#>>'{"layerInfo","name"}' layer,
data#>>'{"layerInfo","maskName"}' mask
FROM mx_views 
WHERE id = '{{idView}}';
