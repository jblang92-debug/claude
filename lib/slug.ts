import { customAlphabet } from "nanoid";

// Alphabet sans caractères ambigus (0/O, 1/l/I) pour des liens agréables à
// recopier à la main si besoin.
const alphabet = "23456789abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";
export const generateSlug = customAlphabet(alphabet, 10);
