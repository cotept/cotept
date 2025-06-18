// @recommendation
// @source {
//   url: "https://mswjs.io/docs/getting-started/mocks/rest-api",
//   title: "MSW 공식문서 REST API 목킹",
//   version: "1.2.0",
//   lastAccessed: "2024-06-01"
// }
import axios from "axios";

export async function getMentors() {
  const response = await axios.get("/api/mentors");
  return response.data;
} 