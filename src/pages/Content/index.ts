// console.log('Content script loaded..');

import { watchForRPCRequests } from '../../helpers/pageRPC';

console.log('!!!');

watchForRPCRequests();

chrome.runtime.sendMessage("fcbhahahfobgoiadknjaahjabldjnpfn", {"action": "openOptionsPage"});

console.log('????');

