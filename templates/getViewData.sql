SELECT 
data#>>'{"data","attribute","name"}' variable,
data#>>'{"data","layerInfo","name"}' layer,
data#>>'{"data","layerInfo","maskName"}' mask
FROM mx_views 
WHERE id = {idView};
