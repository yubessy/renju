import { Box, Center, Stack, Text } from '@chakra-ui/react'
import React, { FC, useContext, useEffect, useMemo, useState } from 'react'
import { AnalyzedDatabase } from '../../../../database'
import { Point } from '../../../../rule'
import { AdvancedStateContext, BoardStateContext } from '../../../contexts'
import GamesPager from './GamesPager'
import GamesTable from './GamesTable'
import SearchController from './SearchController'

const Default: FC = () => {
  const { gameState } = useContext(BoardStateContext)
  const { advancedState } = useContext(AdvancedStateContext)
  const analyzedDB = useMemo(() => new AnalyzedDatabase(), [])
  const pageSize = 20

  const [ready, setReady] = useState<boolean>()
  useEffect(() => {
    ;(async () => setReady(await analyzedDB.ready()))()
  }, [])

  const searchMoves =
    advancedState.searchWithMoves && gameState.current.size > 0
      ? gameState.current.moves
      : undefined
  const searchPlayerId = advancedState.searchPlayerId
  const [page, setPage] = useState<number>(0)

  const [ids, setIds] = useState<number[]>([])
  const [hit, setHit] = useState<number>(0)
  const [error, setError] = useState<string | undefined>()
  const onSearch = async (moves?: Point[], playerId?: number, page?: number) => {
    const { ids, hit, error } = await analyzedDB.search({
      moves,
      playerId,
      limit: pageSize,
      offset: (page ?? 0) * pageSize,
    })
    setIds(ids)
    setHit(hit)
    setError(error)
  }
  useEffect(() => {
    setPage(0)
    onSearch(searchMoves, searchPlayerId)
  }, [searchMoves?.length, searchPlayerId])
  useEffect(() => {
    onSearch(searchMoves, searchPlayerId, page)
  }, [page])
  return (
    <Stack justify="center" align="center">
      <Box width="100%">
        <SearchController />
      </Box>
      {!ready && (
        <Text color="red.600" my="1rem">
          Search failed (maybe app was updated).
          <br />
          Please load file again from &lsquo;Setup&rsquo; tab.
        </Text>
      )}
      {error && (
        <Text color="gray.600" py="1rem">
          {error}
        </Text>
      )}
      {ids.length > 0 && (
        <Center>
          <GamesPager page={page} setPage={setPage} hit={hit} pageSize={pageSize} />
        </Center>
      )}
      {ids.length > 0 && (
        <Box width="100%">
          <GamesTable gameIds={ids} />
        </Box>
      )}
    </Stack>
  )
}

export default Default
