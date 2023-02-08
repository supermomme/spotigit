import { createClient } from 'spotigit'
import io from 'socket.io-client'
import socketio from '@feathersjs/socketio-client'
import jsonwebtoken from 'jsonwebtoken'
import { Worker, Job } from 'bullmq';

const apiHost: string = "ws://127.0.0.1:3030";
const jwtSecret: jsonwebtoken.Secret = 'SXQWMLW6ncAHphD4ExQjPNewBXbYvIXE'
const jwtOptions: jsonwebtoken.SignOptions = {
  algorithm: 'HS256',
  audience: 'https://yourdomain.com',
  expiresIn: '3m'
}


const con = io(apiHost)
const connection = socketio(con)
con.on("connect_error", (error) => {
  console.log('connect_error', error)
});


const client = createClient(connection)

console.log("Welcome to Deno!");


interface RefreshAuthTokenJobData {
  userId?: number
}


const worker = new Worker('refresh-auth-token', async (job: Job<RefreshAuthTokenJobData>) => {
  job.log(`Start Job ${job.id}`)
  const accessToken = jsonwebtoken.sign({ worker: true }, jwtSecret, jwtOptions)  
  await client.authenticate({
    strategy: 'jwt',
    accessToken
  })

  job.log(`authenticated with token: "${accessToken}"`)
  job.log(`job data: ${JSON.stringify(job.data, null, 2)}`)

  const userId = job.data.userId
  if (userId == undefined) throw new Error('No userId set')
  

  const userPage = await client.service('users').find({
    query:{
      id: userId,
      $limit: 1
    },
  })
  if (userPage.total === 0) throw new Error('userId not found')
  const user = userPage.data[0]
  if (!user) throw new Error('userId not found. Mh weird... i just checked that :/')
  const {spotify_access_token, spotify_refresh_token} = user

  /*
  TODO:
  reauth
    then write new token to user
    then queue new job 5min before expire
    catch set needToLoginFlag to user
  */
  console.log({spotify_access_token, spotify_refresh_token})

  return {
    foo: 'baa'
  };
}, {
  connection: {
    host: '127.0.0.1',
    port: 6379
  }
});