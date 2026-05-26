export default function RightPanel() {

  return (

    <div
      className="
      border-white/10
      backdrop-blur-2xl
      border border-white/10
      rounded-[32px]
      p-6
      shadow-2xl
      "
    >

      <h2 className="text-2xl font-bold mb-6">
        En tendencia
      </h2>

      <div className="space-y-5">

        <div>
          <p className="text-gray-500 text-sm">
            Tendencia en Mexico
          </p>

          <p className="font-semibold">
            #Mundial
          </p>
        </div>

        <div>
          <p className="text-gray-500 text-sm">
            Politica
          </p>

          <p className="font-semibold">
            China
          </p>
        </div>

        <div>
          <p className="text-gray-500 text-sm">
            Deportes
          </p>

          <p className="font-semibold">
            Santi Gimenez
          </p>
        </div>

      </div>

    </div>
  );
}