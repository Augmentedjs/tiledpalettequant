type DetailedName = {
  familyName: string;
  givenName: string;
}

type Photo = {
  value: string;
}

type Email = {
  value: string,
  verified: boolean;
}

type User = {
  id: string;
  username: string;
  displayName: string;
  name: DetailedName;
  emails?: Email[];
  photos?: Photo[];
  role?: "admin" | "caregiver" | "manager" | "other";
  password?: string;
  provider?: string;
}

type Profile = {
  id: string;
  username?: string;
  displayName?: string;
  name?: DetailedName;
  emails: Email[];
  photos?: Photo[];
  role: "admin" | "caregiver" | "manager" | "other";
  password?: string;
  provider?: string;
}
