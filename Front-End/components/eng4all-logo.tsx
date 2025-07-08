import Image from "next/image"

export function Eng4AllLogo({ size = 40 }: { size?: number }) {
  return (
    <div style={{ width: size, height: size }}>
      <Image src="/images/eng4all-logo.png" alt="Eng4All Logo" width={size} height={size} priority />
    </div>
  )
}

// Add default export for compatibility
export default Eng4AllLogo
