import { authClient } from "@/lib/auth-client";

export const emailSignUpAPI = async (email: string, password: string, name: string) => {
    try {
        const {data, error} = await authClient.signUp.email({
            email,
            password,
            name,
        })
        if(error) {
            throw error
        }
        return data 
    } catch (error) {
        console.log("emailSignUpAPI error", error)
        throw error
    }
}

export const emailSignInAPI = async (email: string, password: string) => {
    try {
        const {data, error} = await authClient.signIn.email({
            email,
            password,
        })
        if(error) {
            throw error
        }
        return data 
    } catch (error) {
        console.log("emailSignInAPI error", error)
        throw error
    }
}

export const googleSignInAPI = async () => {
    try {
        const {data, error} = await authClient.signIn.social({
            provider: "google",
        })
        if(error) {
            throw error
        }
        return data 
    } catch (error) {
        console.log("googleSignInAPI error", error)
        throw error
    }
}