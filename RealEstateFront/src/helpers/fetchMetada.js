import axios from "axios";

const fetchTokenMetadata = async (uri) => {
    try {
        const url = `${uri}`;
        const response = await axios.get(url);
        const metadata = response.data;
        return metadata;
    } catch (error) {
        console.error("Error al obtener la metadata:", error);
    }
  };

export default fetchTokenMetadata;