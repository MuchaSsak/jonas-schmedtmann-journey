import CabinView from "@/components/CabinView";
import { getCabin, getCabins } from "@/lib/data-service";
import Head from "next/head";
import { useRouter } from "next/router";

// Statically generated (SSG) – getServerSideProps is not supported in a static export
export async function getStaticPaths() {
  const cabins = await getCabins();
  const paths = cabins.map((cabin) => ({
    params: { cabinId: String(cabin.id) },
  }));

  return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
  const cabin = await getCabin(params.cabinId);
  return { props: { cabin } };
}

function Cabin({ cabin }) {
  // const router = useRouter();

  return (
    <>
      <Head>
        {/* <title>Cabin {router.query.cabinId} // The Wild Oasis</title> */}
        <title>{`Cabin ${cabin.name} // The Wild Oasis`}</title>
      </Head>

      <div className="max-w-6xl mx-auto mt-8">
        <CabinView cabin={cabin} />
      </div>
    </>
  );
}

export default Cabin;
