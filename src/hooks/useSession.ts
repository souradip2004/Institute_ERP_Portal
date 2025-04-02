import { auth } from "@/auth";

const abc =  async () => {
    const session = await auth();
}


export default async ()=> {
    const user = await abc()
    return user;
    

}