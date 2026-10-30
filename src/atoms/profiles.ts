import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";


const DEFAULT_PROFILE: Users.Profile = {
  id: "default",
  display_name: "OMisaki",
  profile_picture: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fi.pinimg.com%2Foriginals%2Fe7%2Fec%2F63%2Fe7ec63195bf53e5c90e240926e0875a7.jpg&f=1&nofb=1&ipt=0a5565f909342b30b5a2b48334067346b38f1292ea4cc03464bb4123f66852da&ipo=images",
  background: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwallpaperaccess.com%2Ffull%2F9337015.gif&f=1&nofb=1&ipt=add7813f2ecb9aab627c5ed4dde0d9355deffb7465a3b243510691c46415e3bb&ipo=images",
  media: {
    favorites: []
  }
}


const DEFAULT_DATA: Users.ProfileData = {
  activeProfile: null,
  profiles: [
    DEFAULT_PROFILE
  ]
}


export const profilesAtom = atomWithStorage<Users.ProfileData>("profiles", DEFAULT_DATA);

/** Seletor de perfis aberto (troca em runtime) — estado de UI, não persiste. */
export const profileSwitcherAtom = atom(false);