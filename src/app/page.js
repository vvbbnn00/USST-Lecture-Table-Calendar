import Home from "@/app/body";
import {Theme} from '@radix-ui/themes';
import '@radix-ui/themes/styles.css';
import {getTimeInformation} from "@/utils/information";

export default async function Page() {
    const {schoolYearMap, semesterMap, currentSchoolYear, currentSemester} = await getTimeInformation();
    return (
        <Theme>
            <Home
                schoolYearMap={schoolYearMap}
                semesterMap={semesterMap}
                currentSchoolYear={currentSchoolYear}
                currentSemester={currentSemester}
            ></Home>
        </Theme>
    )
}

