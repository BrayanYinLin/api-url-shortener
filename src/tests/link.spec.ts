// import { describe, expect, it } from 'vitest'
// import { link } from '../models/link.model'
// import axios from 'axios'

// describe('Links tests', () => {
//   //  Passed
//   it.skip('shoud return link info', async () => {
//     const { data, status } = await axios.get(
//       'http://localhost:5373/api/link/?short=costar-kevin-kaarl'
//     )

//     console.log(data)
//     expect(status).toBe(200)
//     expect(() => link.parse(data)).not.toThrow()
//   })

//   //  Passed
//   it.skip('should create a link', async () => {
//     const { data, status } = await axios.post(
//       'http://localhost:5373/api/link/',
//       {
//         long: 'https://music.youtube.com/watch?v=uHv2SSHhprA&si=KTbXaTtjcHTDFvEG',
//         short: 'costar-kevin-kaarl'
//       },
//       {
//         headers: {
//           'Content-Type': 'application/json; charset=utf-8'
//         }
//       }
//     )

//     expect(status).toBe(201)
//     expect(() => link.parse(data)).not.toThrow()
//   })

//   //  Passed
//   it.skip('should update a link', async () => {
//     const { data, status } = await axios.patch(
//       'http://localhost:5373/api/link/e72ff0d0-e7b0-4faa-bb81-8a164609cb21',
//       {
//         long: 'https://music.youtube.com/watch?v=gE2tMp-ou7s&si=sE5bQWrePacGMLDA',
//         short: 'brujas-salem'
//       },
//       {
//         headers: {
//           'Content-Type': 'application/json; charset=utf-8'
//         }
//       }
//     )

//     expect(status).toBe(200)
//     expect(() => link.parse(data)).not.toThrow()
//   })

//   //  Passed
//   it.skip('should delete a link', async () => {
//     const { data, status } = await axios.delete(
//       'http://localhost:5373/api/link/e72ff0d0-e7b0-4faa-bb81-8a164609cb21'
//     )

//     expect(status).toBe(200)
//     expect(data).toHaveProperty('msg')
//     expect(data.msg).toBe('Deleted successfully')
//   })
// })
