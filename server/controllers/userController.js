import sql from "../configs/db.js"

export const getUserCreations = async (req, res)=>{
    try {
        const {userId} = req.auth()

       const creations = await sql`SELECT * FROM creations WHERE user_id = ${userId} ORDER BY created_at DESC`;

        res.json({ success: true, creations });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

export const getPublishedCreations = async (req, res)=>{
    try {

       const creations = await sql`
       SELECT * FROM creations WHERE publish = true ORDER BY created_at DESC`;

        res.json({ success: true, creations });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}


export const toggleLikeCreations = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { id } = req.body;

    const [creation] = await sql`SELECT * FROM creations WHERE id = ${id}`;

    if (!creation) {
      return res.json({ success: false, message: "Creation not found" });
    }

    const userIdStr = String(userId);
    const currentLikes = creation.likes || []; // ensure array

    let updatedQuery;
    let message;

    if (currentLikes.includes(userIdStr)) {
      // remove user
      // use array_remove and COALESCE to be safe if likes is NULL
      await sql`UPDATE creations SET likes = array_remove(COALESCE(likes, ARRAY[]::text[]), ${userIdStr}::text) WHERE id = ${id}`;
      message = "Creation Unliked";
    } else {
      // append user (avoid duplicates by checking above)
      await sql`UPDATE creations SET likes = array_append(COALESCE(likes, ARRAY[]::text[]), ${userIdStr}::text) WHERE id = ${id}`;
      message = "Creation Liked";
    }

    return res.json({ success: true, message });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};
