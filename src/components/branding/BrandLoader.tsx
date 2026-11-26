import BrainBattleLogo from './BrainBattleLogo'

export default function BrandLoader({ message = 'Loading the Battle Arena…' }: { message?: string }) {
  return (
    <div className="brand-loader" role="status" aria-live="polite">
      <BrainBattleLogo width={76} />
      <span className="brand-loader-indicator" aria-hidden="true" />
      <p>{message}</p>
    </div>
  )
}
