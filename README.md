We have the tools for tracking cars on Earth, but with our recent launch to the moon, we need a tool for the Command Centre and 
Field Crews to be able to locate lunar vehicles. 

We currently have 6 vehicles - numbered 0,1,2,3,4 and 5. 

You can find their lunar GPS coordinates and other information using our LunarLocation JSON API:
Calling: cndlunarlocator.herokuapp.com/vehicles/0/locate.json

Returns:
{
  vehicle_id: 0,
  lat: -88.57913126391475,
  long: 79.21747437674591,
  name: "Heuvos Rancheros",
  model: "Rover TX 5",
  power_level_percent: 85
}

The task is to create a javascript-based web front-end that allows staff to choose from the 6 vehicles and obtain their location 
by calling the API specified above. 

The tool should also accept manual input of lunar lat/long to:

1. Show where the vehicle is on the lunar map; and       
2. Calculate the distance from the Command Centre (located at the Apollo 11 landing site at lat:0.681400, long: 23.460550) to the vehicle
or coordinates supplied.

Staff are notoriously fickle and won't use a tool that is difficult to use or difficult to look at. 
This behavior costs the business millions in inefficiencies, as the staff will wander around aimlessly looking for cars 
based purely on “gut-feel”.
