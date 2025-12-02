import React, { useEffect } from 'react'

export function PaginaTerminos() {
  useEffect(() => { document.title = 'FiguMarket - Términos y condiciones' }, [])
  return (
    <section className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold">Términos y condiciones</h1>
      <p className="mt-2 text-gray-700">Última actualización: {new Date().toLocaleDateString()}</p>

      <div className="mt-6 space-y-6 text-gray-800">
        <section>
          <h2 className="text-xl font-semibold">1. Introducción</h2>
          <p className="mt-2">Estos Términos y condiciones regulan el uso de la plataforma FiguMarket, incluyendo la compra, venta y publicación de figuras, así como la comunicación entre usuarios. Al registrarte y utilizar el servicio aceptas estas condiciones.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">2. Registro y cuentas</h2>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>Debes proporcionar información veraz y completa.</li>
            <li>Eres responsable de mantener segura tu cuenta y credenciales.</li>
            <li>El uso de la plataforma debe cumplir las leyes aplicables.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold">3. Publicación y venta de productos</h2>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>Publica únicamente productos permitidos y que poseas legalmente.</li>
            <li>La información (descripción, precio, estado) debe ser fiel y no engañosa.</li>
            <li>Las imágenes deben representar el producto real y respetar derechos de autor.</li>
            <li>Está prohibido publicar material ilegal, ofensivo o fraudulento.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold">4. Comunicación entre usuarios</h2>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>Mantén un trato respetuoso y no acoses ni insultes.</li>
            <li>No compartas datos personales de terceros sin su consentimiento.</li>
            <li>Evita spam, phishing y cualquier conducta engañosa.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold">5. Transacciones y precios</h2>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>Los precios deben expresarse de forma clara y en la moneda indicada.</li>
            <li>Las transacciones deben realizarse conforme a la normativa vigente.</li>
            <li>FiguMarket puede moderar o retirar publicaciones que incumplan estas condiciones.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold">6. Contenido prohibido</h2>
          <p className="mt-2">Se prohíbe, sin limitación: productos falsificados, robados, material que promueva odio o violencia, pornografía, incitación a actividades ilegales y cualquier contenido que infrinja derechos de propiedad intelectual.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">7. Responsabilidad y garantías</h2>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>FiguMarket no garantiza la calidad, seguridad o legalidad de los productos publicados por los usuarios.</li>
            <li>Los acuerdos de compraventa se realizan entre usuarios; la plataforma actúa como intermediaria tecnológica.</li>
            <li>FiguMarket no se hace responsable por pérdidas derivadas de transacciones entre usuarios.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold">8. Moderación y sanciones</h2>
          <p className="mt-2">Nos reservamos el derecho de suspender o eliminar cuentas y publicaciones que incumplan estos Términos, y de comunicar a las autoridades conductas ilícitas.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">9. Propiedad intelectual</h2>
          <p className="mt-2">El contenido de la plataforma (marca, diseño y software) pertenece a FiguMarket. Los usuarios conservan los derechos sobre sus imágenes y descripciones, garantizando que tienen permiso para publicarlas.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">10. Privacidad y datos</h2>
          <p className="mt-2">El tratamiento de datos personales se realiza conforme a la normativa aplicable. No compartas información sensible en las conversaciones. Consulta también la política de privacidad, cuando esté disponible.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">11. Seguridad</h2>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>No intentes vulnerar la seguridad de la plataforma.</li>
            <li>Reporta fallos o vulnerabilidades responsables a FiguMarket.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold">12. Cambios en los Términos</h2>
          <p className="mt-2">Podremos actualizar estos Términos. Te notificaremos cambios relevantes; el uso continuado implica aceptación de la versión vigente.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">13. Contacto</h2>
          <p className="mt-2">Para consultas o reportes, utiliza el apartado de mensajes de la plataforma o el formulario de contacto, cuando esté habilitado.</p>
        </section>
      </div>
    </section>
  )
}