export const exampleModule = {
    id: "example",                          //How your module is identified and catalogued by the shell
    name: "Example",                        //Name of your module
    refreshInterval: 1000,                  //How often your module refreshes data (Currently set to 1 second aka 1000ms)
            

    //Everything here will only run during initialization

    async update() {
        //Everything inside this function will run during each refresh as listed in refreshInterval

        //To utilize the notification panel, use the following code
        //shell.notify("Your message here", millisecondsToDisplayMessage);



        return {
            data: {
                //Export your data here
            },
        };
    },
};