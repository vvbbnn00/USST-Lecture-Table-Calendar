import Home from "@/app/body";
import '@radix-ui/themes/styles.css';
import {getTimeInformation} from "@/utils/information";

export const dynamic = "force-dynamic";

async function Page() {
    const {schoolYearMap, semesterMap, currentSchoolYear, currentSemester} = await getTimeInformation();

    return (
        <>
            <Home
                schoolYearMap={schoolYearMap}
                semesterMap={semesterMap}
                currentSchoolYear={currentSchoolYear}
                currentSemester={currentSemester}
            ></Home>
        </>
    )
}

export default Page
