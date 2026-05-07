-- Custom migration: previne race condition de bookings simultâneos pra
-- mesma data. Drizzle não gera partial unique indexes a partir do schema,
-- então criamos manualmente.
--
-- Postgres não aceita funções voláteis (now()) em WHERE de partial index,
-- então o WHERE só inclui status. A app é responsável por sweepar
-- pending_payment com lock expirado ANTES de tentar inserir um novo
-- booking pra mesma data (ver lib/bookings/service.ts/sweepExpiredLocks).
--
-- Regra do índice: no máximo UM booking com status='confirmed' ou
-- status='pending_payment' por event_date.
--
-- O INSERT que violar lança SQLSTATE 23505 (unique_violation), que
-- app/api/bookings/route.ts traduz em HTTP 409 "date_unavailable".

CREATE UNIQUE INDEX IF NOT EXISTS bookings_active_date_uq
  ON bookings (event_date)
  WHERE status IN ('confirmed', 'pending_payment');
