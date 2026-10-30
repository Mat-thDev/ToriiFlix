declare namespace Users {

  export interface ProfileData {
    activeProfile: Profile | null,
    profiles: Profile[]
  }

  export interface Profile {
    id: string
    display_name: string
    profile_picture: string
    background: string
    media: {
      favorites: ProfileFavorites[]
    }
  }

  export interface ProfileFavorites {
    id: string
    type: string
  }
}