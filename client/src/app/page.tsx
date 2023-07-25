'use client'
import {useEffect, useState} from "react";
import SocketIoProvider from "@/utils/provider/SocketIoProvider";
import {Socket} from "socket.io-client";

export interface User { id: string; name: string }
export interface Message { content: string; username: string }

export default function Home() {
  const [io, setIo] = useState<Socket>()
  const [messages, setMessages] = useState<Message[]>([])
  const [name, setName] = useState<string>()
  const [message, setMessage] = useState<string>("")

  useEffect(() => {
    const oldIo = SocketIoProvider();
    setIo(oldIo);
    const name = prompt('Qual é o seu nome?') ?? "Anônimo";
    setName(name);
    oldIo?.emit('response_new_connection', { name });

    // Adicionar o evento de escuta apenas uma vez no componente
    oldIo?.on('messages', (data) => {
      setMessages(data.messages);
    });

    // Retornar uma função no useEffect para remover o evento quando o componente for desmontado
    return () => {
      oldIo?.off('messages');
      oldIo?.off('response_new_message');
    };
  }, []);


  useEffect(() => {
    // Atualizar o estado corretamente ao receber uma nova mensagem
    const handleNewMessage = (data: any) => {
      setMessages(prevMessages => [...prevMessages, { content: data.content, username: data.username }]);
    };

    io?.on('response_new_message', handleNewMessage);

    // Retornar uma função no useEffect para remover o evento quando o componente for desmontado
    return () => {
      io?.off('response_new_message', handleNewMessage);
    };
  }, [io]);
  const handleSendMessage = () => {
    io?.emit('request_new_message', {
      content: message,
      id: io?.id
    })
  }



  return (
    <div className="m-20">
      <h1 className="text-3xl">Seja bem-vindo ao nosso chat {name}!</h1>
      <div className="ml-10 mt-6">
        <div className="my-2">
          <input className="py-2 px-94 border rounded" type="text" placeholder="Enviar mensagem" value={message} onChange={(e) => setMessage(e.target.value)}/>
          <button className="px-94 py-2 mt-2" type="submit" onClick={() => handleSendMessage()}>Enviar</button>
        </div>
        <ul>
          {messages?.map((e: Message, i: number) => {
            return <li key={i}>
              {e.username}: {e.content}
            </li>
          })}
        </ul>
      </div>
    </div>
  )
}
