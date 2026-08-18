export function profileIdentity(displayName: string | null | undefined, username: string | null | undefined, fallback = "usuario") {
  const normalizedName = displayName?.trim() ?? "";
  const normalizedUser = username?.trim() || fallback;
  const repeatsHandle = normalizedName.toLocaleLowerCase() === normalizedUser.toLocaleLowerCase();
  return {
    displayName: normalizedName && !repeatsHandle ? normalizedName : null,
    handle: `@${normalizedUser}`,
  };
}
