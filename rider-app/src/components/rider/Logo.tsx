export function Logo({ size = 36 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2">
      <div
      >
        <img src="./ridu_logo.png" width={150} height={150} alt="rideuu" />

      </div>
      <div className="font-bold tracking-tight text-foreground">
        {/* Namma<span className="text-primary">Drive</span> */}
      </div>
    </div>
  );
}
