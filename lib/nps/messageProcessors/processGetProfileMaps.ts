import { BareMessage } from "../messageStructs/BareMessage.js";
import { BareMessageV0 } from "../messageStructs/BareMessageV0.js";
import { getDWord, getAsHex } from "../utils/pureGet.js";
import { SocketCallback } from "../messageProcessors/index.js";
import { getGameProfilesForCustomerId } from "../services/profile.js";
import { NPSList } from "../messageStructs/NPSList.js";
import { ProfileList } from "../messageStructs/ProfileList.js";

export function processGetProfileMaps(
    connectionId: string,
    message: BareMessage,
    socketCallback: SocketCallback,
): void {
    const customerId = getDWord(message.getData(), 0, false);

    console.log(`GetProfileMaps: ${customerId}`);

    // Look up the profiles for the customer ID
    const profiles = getGameProfilesForCustomerId(customerId);

    // Create a new NPSList of profiles
    const list = new ProfileList();

    // Add each profile to the list
    if (profiles) {
        for (const profile of profiles) {
            // Log the profile
            console.log(profile.toString());

            list.addProfile(profile);
        }
    }

    // Send the list back to the client
try {
        const outMessage = BareMessage.new(0x607);
    
        // Set the message data
        const messageData = list.toBytes();
        // Log the message data
        console.log(`GetProfileMaps: ${getAsHex(messageData)}`);
    
        outMessage.setData(messageData);
    
        // Log the message
        console.log(`GetProfileMaps: ${outMessage.toString()}`);
    
        console.log('===========================================');
    
        socketCallback([outMessage.toBytes()]);
} catch (error) {
    console.log(error);
}
}
