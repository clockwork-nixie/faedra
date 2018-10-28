#Faedra

To configure the application you'll need a MySQL database schema set-up.</BR>
Create a top-level _server.secret.json_ file with the following properties:

~~~~
{
    "dataStoreUsername": "username@database",
    "dataStorePassword": "password",
    "dataStoreHost": "database.mariadb.database.azure.com",
    "dataStoreSchema": "database"
}
~~~~