import { ClapButton } from '@blog/ui-library'
import { fetchClaps, saveClaps } from '../../lib/supabase'

type ClapButtonWrapperProps = {
  slug: string
}

export function ClapButtonWrapper({ slug }: ClapButtonWrapperProps) {
  return (
    <ClapButton
      fetchClaps={() => fetchClaps(slug)}
      saveAddedClaps={(noOfClaps: number) => saveClaps(slug, noOfClaps)}
    />
  )
}
