
export const gerarUsuarioAutomatico = (nomeCompleto) => {
  if (!nomeCompleto) return "";

  const partes = nomeCompleto.trim().split(/\s+/);
  const primeiroNome = partes[0].toLowerCase();
  const ultimoNome = partes[partes.length - 1].toLowerCase();

  return `${primeiroNome}.${ultimoNome}`;
};

export const formatPrimeiroEUltimoNome = (nomeCompleto) => {
  if (!nomeCompleto) return "";

  const partes = nomeCompleto.trim().split(/\s+/);
  if (partes.length === 1) {
    return partes[0][0].toUpperCase() + partes[0].slice(1).toLowerCase();
  }

  const primeiro = partes[0];
  const ultimo = partes[partes.length - 1];

  const capitalize = (str) =>
    str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

  return `${capitalize(primeiro)} ${capitalize(ultimo)}`;
};

export const formatNomeCompleto = (nomeCompleto) => {
  if (!nomeCompleto) return "";

  const capitalize = (str) =>
    str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

  return nomeCompleto
    .trim()
    .split(/\s+/) // divide pelos espaços
    .map(capitalize) // aplica em cada palavra
    .join(" "); // junta de volta
};