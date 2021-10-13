import { ServiceBusClient, ServiceBusAdministrationClient, ServiceBusError } from "@azure/service-bus";
import { table } from "console";

const connstring = 'Endpoint=sb://umbrella.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=U8bc/mmiFGL44soVmwKo2WwRkuXLJRiPbpJ8hPuMCZE=';


async function getQueue (serviceBusClient: ServiceBusClient, name: string) {
    try {
        const queue = serviceBusClient.createReceiver(name, {
            receiveMode: "peekLock"
        })
        return queue;
    } catch (error) {
        if (error instanceof ServiceBusError) {
            if (error.name === "ServiceBusError") {
                console.log(error);
                console.error("Queue does not exist. Creating queue...")
                return false;
            }
        } else {
            throw error
        }
    }
}


(async () => {
    const serviceBusClient = new ServiceBusClient(connstring)
    const serviceBusAdministrationClient = new ServiceBusAdministrationClient(connstring);

    const queueName = 'scrypteur'
    const exists = serviceBusAdministrationClient.queueExists(queueName)
    if (!exists) {
        console.log("Queue does not exist.")
        return
    }

    const queue = await getQueue(serviceBusClient, queueName)
    if (!queue) {
        return
    }

    for (const msg of await queue.receiveMessages(10)) {
        console.log(msg.body.toString());
    }

    queue.close();
    serviceBusClient.close();
})()
