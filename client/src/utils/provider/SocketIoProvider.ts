import {io} from "socket.io-client"
const SocketIoProvider =  () => io("http://localhost:3001")
export default SocketIoProvider