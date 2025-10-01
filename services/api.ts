// This file is the new single source of truth for API calls.
// It uses the neon-api service, which communicates with our Postgres database via a Netlify function.

export {
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    getDatePosts,
    getDatePost,
    createDatePost,
    updateDatePost,
    deleteDatePost,
    getMessages,
    createMessage,
    toggleInterest,
    chooseApplicant,
} from './neon-api';
