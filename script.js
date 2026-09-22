
/* =========================================================
   STUDENTLENS - COMPLETE UPDATED SCRIPT.JS
   ========================================================= */


/* =========================================================
   CONFIGURATION
   ========================================================= */

const PROFILE_STORAGE_KEY = "studentLensProfile";
/* =========================================================
   RECENTLY VIEWED COLLEGES
   ========================================================= */

const RECENTLY_VIEWED_STORAGE_KEY =
    "studentLensRecentlyViewed";

const MAX_RECENTLY_VIEWED_COLLEGES = 5;


function getRecentlyViewedCollegeIds() {
    const stored =
        localStorage.getItem(
            RECENTLY_VIEWED_STORAGE_KEY
        );

    if (!stored) {
        return [];
    }

    try {
        const parsed = JSON.parse(stored);

        if (!Array.isArray(parsed)) {
            return [];
        }

        return parsed
            .map(Number)
            .filter(function (id) {
                return Number.isFinite(id);
            });

    } catch (error) {
        console.error(
            "Invalid recently viewed colleges data:",
            error
        );

        return [];
    }
}


function saveRecentlyViewedCollegeIds(ids) {
    localStorage.setItem(
        RECENTLY_VIEWED_STORAGE_KEY,
        JSON.stringify(ids)
    );
}


function rememberRecentlyViewedCollege(collegeId) {
    const id = Number(collegeId);

    if (!Number.isFinite(id)) {
        return;
    }

    let recentlyViewedIds =
        getRecentlyViewedCollegeIds();

    recentlyViewedIds =
        recentlyViewedIds.filter(function (savedId) {
            return savedId !== id;
        });

    recentlyViewedIds.unshift(id);

    recentlyViewedIds =
        recentlyViewedIds.slice(
            0,
            MAX_RECENTLY_VIEWED_COLLEGES
        );

    saveRecentlyViewedCollegeIds(
        recentlyViewedIds
    );
}


async function loadRecentlyViewedColleges() {
    const container =
        getElement("recentCollegeList");

    if (!container) {
        return;
    }

    try {
        const colleges =
            await fetchColleges();

        const recentlyViewedIds =
            getRecentlyViewedCollegeIds();

        const recentlyViewedColleges =
            recentlyViewedIds
                .map(function (id) {
                    return colleges.find(function (college) {
                        return Number(college.id) === id;
                    });
                })
                .filter(Boolean);

        container.innerHTML = "";

        if (recentlyViewedColleges.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>No Recently Viewed Colleges</h3>

                    <p>
                        Explore colleges to see your
                        recently viewed colleges here.
                    </p>

                    <button
                        type="button"
                        class="primary design-primary"
                        onclick="goToColleges()">

                        Explore Colleges
                    </button>
                </div>
            `;

            return;
        }

        recentlyViewedColleges.forEach(function (college) {
            const card =
                createCollegeCard(college);

            container.appendChild(card);
        });

    } catch (error) {
        console.error(
            "Recently viewed colleges error:",
            error
        );

        showMessage(
            container,
            "Unable to Load Recent Colleges",
            "Please try again later."
        );
    }
}

const SAVED_COLLEGES_STORAGE_KEY =
    "studentLensSavedColleges";

const USERS_STORAGE_KEY =
    "studentLensUsers";


/* =========================================================
   COMMON HELPERS
   ========================================================= */

function getElement(id) {
    return document.getElementById(id);
}


function escapeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function getDataPath() {
    const path = window.location.pathname;

    if (
        path.includes("/pages/") ||
        path.includes("\\pages\\")
    ) {
        return "../data/colleges.json";
    }

    return "data/colleges.json";
}


async function fetchColleges() {
    if (!window.supabaseClient) {
        throw new Error("Supabase client is not initialized.");
    }

    const {
        data,
        error
    } = await window.supabaseClient
        .from("colleges")
        .select("*")
        .order("id", { ascending: true });

    if (error) {
        console.error("Supabase college loading error:", error);
        throw error;
    }

    if (!Array.isArray(data)) {
        throw new Error("College data must be an array.");
    }

    return data.map(function (college) {
        let courses = college.courses;

        if (typeof courses === "string") {
            courses = courses
                .split(",")
                .map(function (course) {
                    return course.trim();
                })
                .filter(Boolean);
        }

        if (!Array.isArray(courses)) {
            courses = [];
        }

        return {
            ...college,
            courses: courses
        };
    });
}

function showMessage(
    container,
    title,
    message
) {
    if (!container) {
        return;
    }

    container.innerHTML = `
        <div class="card design-card">
            <h3>${escapeHTML(title)}</h3>
            <p>${escapeHTML(message)}</p>
        </div>
    `;
}


/* =========================================================
   ICONS
   ========================================================= */

function getCollegeIcon() {
    return `
        <div class="professional-icon" aria-hidden="true">
            <svg
                viewBox="0 0 24 24"
                width="30"
                height="30"
                fill="none"
                stroke="currentColor"
                stroke-width="1.7"
                stroke-linecap="round"
                stroke-linejoin="round">

                <path d="M2 9L12 4L22 9L12 14L2 9Z"></path>
                <path d="M6 11V16C9 19 15 19 18 16V11"></path>
                <path d="M22 9V15"></path>
            </svg>
        </div>
    `;
}


function getAIIcon() {
    return `
        <div class="professional-icon" aria-hidden="true">
            <svg
                viewBox="0 0 24 24"
                width="30"
                height="30"
                fill="none"
                stroke="currentColor"
                stroke-width="1.7"
                stroke-linecap="round"
                stroke-linejoin="round">

                <rect x="4" y="4" width="16" height="16" rx="4"></rect>
                <path d="M8 9H16"></path>
                <path d="M8 13H13"></path>
                <path d="M8 17H11"></path>
                <path d="M16 16V16.01"></path>
            </svg>
        </div>
    `;
}


/* =========================================================
   HOMEPAGE SEARCH
   ========================================================= */

function searchCollege() {
    const searchInput =
        document.querySelector(".search-box input");

    if (!searchInput) {
        return;
    }

    const searchValue =
        searchInput.value.trim();

    if (!searchValue) {
        alert("Please enter a college name or location.");
        return;
    }

    window.location.href =
        "pages/colleges.html?search=" +
        encodeURIComponent(searchValue);
}


/* =========================================================
   COLLEGE CARD CREATION
   ========================================================= */

function createCollegeCard(college) {
    const card = document.createElement("div");

    card.className =
        "card design-card college-card";

    const collegeId =
        Number(college.id);

    card.innerHTML = `
        <div class="college-card-header">
            ${getCollegeIcon()}

            <span class="college-type">
                ${escapeHTML(college.type || "College")}
            </span>
        </div>

        <h3>
            ${escapeHTML(college.name)}
        </h3>

        <p class="college-location">
            <strong>Location:</strong>
            ${escapeHTML(college.location)}
        </p>

        <div class="college-details-list">
            <p>
                <strong>Rating:</strong>
                ${escapeHTML(college.rating || "Not available")}
            </p>

            <p>
                <strong>Fees:</strong>
                ${escapeHTML(college.fees || "Not available")}
            </p>

            <p>
                <strong>Placement:</strong>
                ${escapeHTML(college.placement || "Not available")}
            </p>
        </div>

        <div class="card-actions">
            <button
                type="button"
                class="primary design-primary"
                onclick="viewCollege(${collegeId})">

                View College
            </button>

            <button
                type="button"
                class="secondary design-secondary"
                onclick="saveCollege(${collegeId})">

                Save College
            </button>
        </div>
    `;

    return card;
}


function renderCollegeCards(
    colleges,
    container
) {
    if (!container) {
        return;
    }

    container.innerHTML = "";

    if (
        !Array.isArray(colleges) ||
        colleges.length === 0
    ) {
        showMessage(
            container,
            "No Colleges Found",
            "Try searching with another college name or location."
        );

        return;
    }

    colleges.forEach(function (college) {
        container.appendChild(
            createCollegeCard(college)
        );
    });
}


/* =========================================================
   LOAD COLLEGES
   ========================================================= */

async function loadColleges() {
    const container =
        getElement("collegeContainer");

    if (!container) {
        return;
    }

    try {
        const colleges =
            await fetchColleges();

        renderCollegeCards(
            colleges,
            container
        );
    }
    catch (error) {
        console.error(
            "Error loading colleges:",
            error
        );

        showMessage(
            container,
            "Unable to Load Colleges",
            "Please check your connection and try again."
        );
    }
}


/* =========================================================
   SEARCH COLLEGES
   ========================================================= */


async function searchColleges() {
    await applyCollegeFilters();
}


function parseCollegeFees(fees) {
    if (fees === null || fees === undefined) {
        return 0;
    }

    const feeText = String(fees)
        .toLowerCase()
        .replace(/,/g, "")
        .replace(/₹/g, "")
        .trim();

    const numberMatch = feeText.match(/[\d.]+/);

    if (!numberMatch) {
        return 0;
    }

    const number = Number(numberMatch[0]);

    if (
        feeText.includes("lakh") ||
        feeText.includes("lac")
    ) {
        return number * 100000;
    }

    return number;
}


function parseCollegeRating(rating) {
    const value = Number(
        String(rating || "").replace(/[^\d.]/g, "")
    );

    return Number.isFinite(value) ? value : 0;
}


function populateCollegeFilters(colleges) {
    const locationFilter = getElement("locationFilter");
    const courseFilter = getElement("courseFilter");

    if (!locationFilter || !courseFilter) {
        return;
    }

    const currentLocation = locationFilter.value;
    const currentCourse = courseFilter.value;

    const locations = [...new Set(
        colleges
            .map(college => String(college.location || "").trim())
            .filter(Boolean)
    )].sort();

    const courses = [...new Set(
        colleges.flatMap(function (college) {
            return Array.isArray(college.courses)
                ? college.courses
                : [];
        })
            .map(course => String(course).trim())
            .filter(Boolean)
    )].sort();

    locationFilter.innerHTML =
        '<option value="">All Locations</option>';

    locations.forEach(function (location) {
        const option = document.createElement("option");

        option.value = location;
        option.textContent = location;

        locationFilter.appendChild(option);
    });

    courseFilter.innerHTML =
        '<option value="">All Courses</option>';

    courses.forEach(function (course) {
        const option = document.createElement("option");

        option.value = course;
        option.textContent = course;

        courseFilter.appendChild(option);
    });

    if (locations.includes(currentLocation)) {
        locationFilter.value = currentLocation;
    }

    if (courses.includes(currentCourse)) {
        courseFilter.value = currentCourse;
    }
}


async function applyCollegeFilters() {
    const searchInput = getElement("collegeSearch");
    const locationFilter = getElement("locationFilter");
    const courseFilter = getElement("courseFilter");
    const budgetFilter = getElement("budgetFilter");
    const sortFilter = getElement("sortFilter");
    const container = getElement("collegeContainer");

    if (!container) {
        return;
    }

    try {
        const colleges = await fetchColleges();

        populateCollegeFilters(colleges);

        const searchValue = searchInput
            ? searchInput.value.trim().toLowerCase()
            : "";

        const selectedLocation = locationFilter
            ? locationFilter.value.toLowerCase()
            : "";

        const selectedCourse = courseFilter
            ? courseFilter.value.toLowerCase()
            : "";

        const selectedBudget = budgetFilter
            ? budgetFilter.value
            : "";

        const selectedSort = sortFilter
            ? sortFilter.value
            : "";

        let filteredColleges = colleges.filter(function (college) {
            const name = String(college.name || "")
                .toLowerCase();

            const location = String(college.location || "")
                .toLowerCase();

            const type = String(college.type || "")
                .toLowerCase();

            const courses = Array.isArray(college.courses)
                ? college.courses.map(course =>
                    String(course).toLowerCase()
                )
                : [];

            const searchMatches =
                !searchValue ||
                name.includes(searchValue) ||
                location.includes(searchValue) ||
                type.includes(searchValue) ||
                courses.some(course =>
                    course.includes(searchValue)
                );

            const locationMatches =
                !selectedLocation ||
                location === selectedLocation;

            const courseMatches =
                !selectedCourse ||
                courses.some(course =>
                    course === selectedCourse
                );

            const collegeFees = parseCollegeFees(
                college.fees
            );

            const budgetMatches =
                !selectedBudget ||
                (
                    collegeFees > 0 &&
                    collegeFees <= Number(selectedBudget)
                );

            return (
                searchMatches &&
                locationMatches &&
                courseMatches &&
                budgetMatches
            );
        });

        filteredColleges.sort(function (first, second) {
            const firstRating = parseCollegeRating(first.rating);
            const secondRating = parseCollegeRating(second.rating);

            const firstFees = parseCollegeFees(first.fees);
            const secondFees = parseCollegeFees(second.fees);

            switch (selectedSort) {
                case "rating-high":
                    return secondRating - firstRating;

                case "rating-low":
                    return firstRating - secondRating;

                case "fees-low":
                    return firstFees - secondFees;

                case "fees-high":
                    return secondFees - firstFees;

                default:
                    return 0;
            }
        });

        renderCollegeCards(
            filteredColleges,
            container
        );

        const noMessage = getElement("noCollegeMessage");

        if (noMessage) {
            noMessage.style.display =
                filteredColleges.length === 0
                    ? "block"
                    : "none";
        }

    } catch (error) {
        console.error("College filtering error:", error);

        showMessage(
            container,
            "Filtering Failed",
            "Unable to filter colleges. Please try again."
        );
    }
}


function resetCollegeFilters() {
    const searchInput = getElement("collegeSearch");
    const locationFilter = getElement("locationFilter");
    const courseFilter = getElement("courseFilter");
    const budgetFilter = getElement("budgetFilter");
    const sortFilter = getElement("sortFilter");

    if (searchInput) searchInput.value = "";
    if (locationFilter) locationFilter.value = "";
    if (courseFilter) courseFilter.value = "";
    if (budgetFilter) budgetFilter.value = "";
    if (sortFilter) sortFilter.value = "";

    applyCollegeFilters();
}

/* =========================================================
   HOMEPAGE SEARCH PARAMETER
   ========================================================= */

function loadHomepageSearch() {
    const searchInput =
        getElement("collegeSearch");

    if (!searchInput) {
        return;
    }

    const params =
        new URLSearchParams(
            window.location.search
        );

    const searchValue =
        params.get("search");

    if (searchValue) {
        searchInput.value = searchValue;
        searchColleges();
    }
}


/* =========================================================
   COLLEGE NAVIGATION
   ========================================================= */

function viewCollege(collegeId) {
    const id = Number(collegeId);

    if (!Number.isFinite(id)) {
        console.error(
            "Invalid college ID:",
            collegeId
        );

        return;
    }

    rememberRecentlyViewedCollege(id);

    window.location.href =
        getPagePath("college-details.html") +
        "?id=" +
        encodeURIComponent(id);
}

function goBackToColleges() {
    window.location.href = getPagePath("colleges.html");
}


function findMyCollege() {
    window.location.href = getPagePath("ai-advisor.html");
}


function compareColleges() {
    window.location.href = getPagePath("compare.html");
}



/* =========================================================
   ENHANCED COLLEGE DETAILS
   ========================================================= */

async function loadCollegeDetails() {

    const container =
        getElement("collegeDetails");

    if (!container) {
        return;
    }

    const params =
        new URLSearchParams(
            window.location.search
        );

    const collegeId =
        params.get("id");

    if (!collegeId) {

        showMessage(
            container,
            "College Not Selected",
            "Please select a college to view its details."
        );

        return;
    }

    try {

        const colleges =
            await fetchColleges();

        const college =
            colleges.find(function (item) {

                return String(item.id) ===
                    String(collegeId);

            });

        if (!college) {

            showMessage(
                container,
                "College Not Found",
                "The selected college could not be found."
            );

            return;
        }

        /*
           Check whether college is already saved
        */

        const savedCollegeIds =
            await getSavedCollegeIds();

        const isSaved =
            savedCollegeIds.includes(Number(college.id));

        /*
           Prepare courses
        */

        const courses =
            Array.isArray(college.courses)
                ? college.courses
                : [];

        const coursesHTML =
            courses.length > 0

                ? courses.map(function (course) {

                    return `
                        <li>
                            ${escapeHTML(course)}
                        </li>
                    `;

                }).join("")

                : `
                    <li>
                        Course information is not available.
                    </li>
                `;

        /*
           Display college details
        */

        container.innerHTML = `

            <article
                class="card design-card college-details-card"
            >

                <div class="college-card-header">

                    ${getCollegeIcon()}

                    <span class="college-type">

                        ${escapeHTML(
            college.type || "College"
        )}

                    </span>

                </div>


                <h2 class="college-details-title">

                    ${escapeHTML(
            college.name || "Unknown College"
        )}

                </h2>


                <p class="college-details-location">

                    <strong>Location:</strong>

                    ${escapeHTML(
            college.location || "Not available"
        )}

                </p>


                <div class="college-details-grid">

                    <div class="college-info-item">

                        <span class="info-label">
                            Rating
                        </span>

                        <strong>
                            ${escapeHTML(
            String(
                college.rating ||
                "Not available"
            )
        )}
                        </strong>

                    </div>


                    <div class="college-info-item">

                        <span class="info-label">
                            Fees
                        </span>

                        <strong>
                            ${escapeHTML(
            college.fees ||
            "Not available"
        )}
                        </strong>

                    </div>


                    <div class="college-info-item">

                        <span class="info-label">
                            Average Placement
                        </span>

                        <strong>
                            ${escapeHTML(
            college.placement ||
            "Not available"
        )}
                        </strong>

                    </div>


                    <div class="college-info-item">

                        <span class="info-label">
                            Institution Type
                        </span>

                        <strong>
                            ${escapeHTML(
            college.type ||
            "Not available"
        )}
                        </strong>

                    </div>

                </div>


                <div class="college-details-section">

                    <h3>
                        Courses Offered
                    </h3>

                    <ul class="ai-reasons">

                        ${coursesHTML}

                    </ul>

                </div>


                <div class="card-actions">

                    <button
                        class="primary design-primary"
                        type="button"
                        onclick="toggleCollegeSave(
                            '${escapeHTML(String(college.id))}'
                        )"
                    >

                        ${isSaved
                ? "Remove from Saved"
                : "Save College"
            }

                    </button>


                    <button
                        class="secondary design-secondary"
                        type="button"
                        onclick="openCollegeComparison(
                            '${escapeHTML(String(college.id))}'
                        )"
                    >

                        Compare College

                    </button>


                    <button
                        class="secondary design-secondary"
                        type="button"
                        onclick="goBackToColleges()"
                    >

                        Back to Colleges

                    </button>

                </div>

            </article>

        `;

    } catch (error) {

        console.error(
            "College details loading error:",
            error
        );

        container.innerHTML = `

            <div class="card design-card">

                <h3>
                    Unable to Load College
                </h3>

                <p>
                    Please check your data and try again.
                </p>

                <button
                    class="primary"
                    type="button"
                    onclick="goBackToColleges()"
                >

                    Back to Colleges

                </button>

            </div>

        `;

    }

}
/* =========================================================
   SUPABASE SAVED COLLEGES
   ========================================================= */

async function getSavedCollegeIds() {
    const user = await getSupabaseUser();

    if (!user) {
        return [];
    }

    const { data, error } = await window.supabaseClient
        .from("saved_colleges")
        .select("college_id")
        .eq("user_id", user.id);

    if (error) {
        console.error("Error fetching saved colleges:", error);
        return [];
    }

    return (data || []).map(function (item) {
        return Number(item.college_id);
    });
}


async function isCollegeSaved(collegeId) {
    const user = await getSupabaseUser();

    if (!user) {
        return false;
    }

    const { data, error } = await window.supabaseClient
        .from("saved_colleges")
        .select("id")
        .eq("user_id", user.id)
        .eq("college_id", Number(collegeId))
        .maybeSingle();

    if (error) {
        console.error("Error checking saved college:", error);
        return false;
    }

    return data !== null;
}


async function saveCollege(collegeId) {
    const id = Number(collegeId);

    if (!Number.isFinite(id)) {
        return false;
    }

    const user = await getSupabaseUser();

    if (!user) {
        alert("Please log in to save colleges.");
        window.location.href = getPagePath("login.html");
        return false;
    }

    const alreadySaved = await isCollegeSaved(id);

    if (alreadySaved) {
        alert("This college is already saved.");
        return true;
    }

    const { error } = await window.supabaseClient
        .from("saved_colleges")
        .insert({
            user_id: user.id,
            college_id: id
        });

    if (error) {
        console.error("Error saving college:", error);
        alert("Unable to save college.");
        return false;
    }

    alert("College saved successfully.");
    await updateSavedCollegeCount();

    return true;
}


async function removeSavedCollege(collegeId) {
    const id = Number(collegeId);
    const user = await getSupabaseUser();

    if (!user || !Number.isFinite(id)) {
        return false;
    }

    const { error } = await window.supabaseClient
        .from("saved_colleges")
        .delete()
        .eq("user_id", user.id)
        .eq("college_id", id);

    if (error) {
        console.error("Error removing saved college:", error);
        alert("Unable to remove college.");
        return false;
    }

    alert("College removed from saved colleges.");
    await updateSavedCollegeCount();

    return true;
}


async function toggleCollegeSave(collegeId) {
    const id = Number(collegeId);

    if (!Number.isFinite(id)) {
        return;
    }

    const user = await getSupabaseUser();

    if (!user) {
        alert("Please log in to continue.");
        window.location.href = getPagePath("login.html");
        return;
    }

    const saved = await isCollegeSaved(id);

    if (saved) {
        await removeSavedCollege(id);
    } else {
        await saveCollege(id);
    }

    await loadCollegeDetails();
}


async function loadSavedColleges() {
    const container = getElement("savedCollegeContainer");

    if (!container) {
        return;
    }

    try {
        const colleges = await fetchColleges();
        const savedIds = await getSavedCollegeIds();

        const savedColleges = colleges.filter(function (college) {
            return savedIds.includes(Number(college.id));
        });

        container.innerHTML = "";

        if (savedColleges.length === 0) {
            showMessage(
                container,
                "No Saved Colleges",
                "You have not saved any colleges yet."
            );
            return;
        }

        savedColleges.forEach(function (college) {
            const card = createCollegeCard(college);
            const removeButton = document.createElement("button");

            removeButton.type = "button";
            removeButton.className = "secondary design-secondary";
            removeButton.textContent = "Remove";

            removeButton.addEventListener("click", async function () {
                const removed = await removeSavedCollege(college.id);

                if (removed) {
                    await loadSavedColleges();
                }
            });

            const actions = card.querySelector(".card-actions");

            if (actions) {
                actions.appendChild(removeButton);
            }

            container.appendChild(card);
        });
    } catch (error) {
        console.error("Saved colleges error:", error);

        showMessage(
            container,
            "Unable to Load Saved Colleges",
            "Please try again later."
        );
    }
}


async function updateSavedCollegeCount() {
    const user = await getSupabaseUser();

    if (!user) {
        return;
    }

    const { count, error } = await window.supabaseClient
        .from("saved_colleges")
        .select("id", {
            count: "exact",
            head: true
        })
        .eq("user_id", user.id);

    if (error) {
        console.error("Error updating saved college count:", error);
        return;
    }

    const countElements = document.querySelectorAll(
        "[data-saved-count], [data-saved-college-count], #savedCollegeCount"
    );

    countElements.forEach(function (element) {
        element.textContent = count || 0;
    });
}


/* =========================================================
   COLLEGE COMPARISON
   ========================================================= */

function getComparisonIds() {
    const saved =
        sessionStorage.getItem(
            "studentLensCompareColleges"
        );

    if (!saved) {
        return [];
    }

    try {
        const ids =
            JSON.parse(saved);

        return Array.isArray(ids)
            ? ids.map(Number)
            : [];
    }
    catch (error) {
        return [];
    }
}


function saveComparisonIds(ids) {
    sessionStorage.setItem(
        "studentLensCompareColleges",
        JSON.stringify(ids)
    );
}


function addCollegeToComparison(collegeId) {
    const id =
        Number(collegeId);

    let ids =
        getComparisonIds();

    if (ids.includes(id)) {
        alert("This college is already selected.");
        return;
    }

    if (ids.length >= 2) {
        alert("You can compare only two colleges.");
        return;
    }

    ids.push(id);

    saveComparisonIds(ids);

    alert("College added for comparison.");

    window.location.href = getPagePath("compare.html");
}


async function loadComparisonColleges() {
    const collegeOne = getElement("collegeOne");
    const collegeTwo = getElement("collegeTwo");

    if (!collegeOne || !collegeTwo) {
        return;
    }

    try {
        const colleges = await fetchColleges();

        collegeOne.innerHTML = `
            <option value="">Select first college</option>
        `;

        collegeTwo.innerHTML = `
            <option value="">Select second college</option>
        `;

        colleges.forEach(function (college) {
            const optionOne = document.createElement("option");
            optionOne.value = String(college.id);
            optionOne.textContent = college.name;

            const optionTwo = document.createElement("option");
            optionTwo.value = String(college.id);
            optionTwo.textContent = college.name;

            collegeOne.appendChild(optionOne);
            collegeTwo.appendChild(optionTwo);
        });

        loadComparisonSelection();

    } catch (error) {
        console.error("Error loading comparison colleges:", error);
    }
}
async function compareSelectedColleges() {
    const collegeOneSelect = getElement("collegeOne");
    const collegeTwoSelect = getElement("collegeTwo");

    const comparisonSection = getElement("comparisonSection");
    const comparisonResult = getElement("comparisonResult");

    if (!collegeOneSelect || !collegeTwoSelect) {
        console.error(
            "College selection elements were not found."
        );

        return;
    }

    const collegeOneId = collegeOneSelect.value;
    const collegeTwoId = collegeTwoSelect.value;

    if (!collegeOneId || !collegeTwoId) {
        alert("Please select two colleges to compare.");
        return;
    }

    if (collegeOneId === collegeTwoId) {
        alert("Please select two different colleges.");
        return;
    }

    if (!comparisonResult) {
        console.error(
            "Comparison result container was not found."
        );

        return;
    }

    try {
        const colleges = await fetchColleges();

        const firstCollege = colleges.find(function (college) {
            return String(college.id) === String(collegeOneId);
        });

        const secondCollege = colleges.find(function (college) {
            return String(college.id) === String(collegeTwoId);
        });

        if (!firstCollege || !secondCollege) {
            alert(
                "Unable to find the selected colleges."
            );

            return;
        }

        renderComparisonTable(
            [firstCollege, secondCollege],
            comparisonResult
        );

        if (comparisonSection) {
            comparisonSection.style.display = "block";

            comparisonSection.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }

    } catch (error) {
        console.error(
            "Comparison error:",
            error
        );

        alert(
            "Unable to compare colleges. Please try again."
        );
    }
}



function renderComparisonTable(
    colleges,
    container
) {
    if (!container) {
        return;
    }

    if (colleges.length < 2) {
        showMessage(
            container,
            "Comparison Not Ready",
            "Select two colleges to compare them."
        );

        return;
    }

    const first =
        colleges[0];

    const second =
        colleges[1];

    container.innerHTML = `
        <div class="comparison-table-wrapper">
            <table class="comparison-table">
                <thead>
                    <tr>
                        <th>Category</th>
                        <th>${escapeHTML(first.name)}</th>
                        <th>${escapeHTML(second.name)}</th>
                    </tr>
                </thead>

                <tbody>
                    <tr>
                        <td>Location</td>
                        <td>${escapeHTML(first.location)}</td>
                        <td>${escapeHTML(second.location)}</td>
                    </tr>

                    <tr>
                        <td>Type</td>
                        <td>${escapeHTML(first.type)}</td>
                        <td>${escapeHTML(second.type)}</td>
                    </tr>

                    <tr>
                        <td>Rating</td>
                        <td>${escapeHTML(first.rating)}</td>
                        <td>${escapeHTML(second.rating)}</td>
                    </tr>

                    <tr>
                        <td>Fees</td>
                        <td>${escapeHTML(first.fees)}</td>
                        <td>${escapeHTML(second.fees)}</td>
                    </tr>

                    <tr>
                        <td>Placement</td>
                        <td>${escapeHTML(first.placement)}</td>
                        <td>${escapeHTML(second.placement)}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;
}


/* =========================================================
   AI ADVISOR HELPERS
   ========================================================= */
















/* =====================================================
   AI ADVISOR - UPDATED FUNCTIONALITY
   ===================================================== */


/* -----------------------------------------------------
   CONVERT FEE TEXT INTO A NUMBER
   Supports values such as:
   ₹1,20,000
   1.5 Lakhs
   2 Lakhs
   ----------------------------------------------------- */

function getBudgetValue(fees) {
    if (fees === null || fees === undefined) {
        return 0;
    }

    const feeText = String(fees)
        .toLowerCase()
        .replace(/,/g, "")
        .replace(/₹/g, "")
        .trim();

    const numberMatch = feeText.match(/[\d.]+/);

    if (!numberMatch) {
        return 0;
    }

    const number = Number(numberMatch[0]);

    if (feeText.includes("lakh") || feeText.includes("lac")) {
        return number * 100000;
    }

    return number;
}


/* -----------------------------------------------------
   CONVERT BUDGET SELECT VALUE INTO A MAXIMUM FEE
   ----------------------------------------------------- */

function getBudgetLimit(value) {
    switch (String(value)) {
        case "1":
            return 100000;

        case "2":
            return 200000;

        case "3":
            return 300000;

        case "4":
            return Infinity;

        default:
            return 0;
    }
}


/* -----------------------------------------------------
   GET PLACEMENT VALUE
   ----------------------------------------------------- */

function getPlacementValue(placement) {
    if (placement === null || placement === undefined) {
        return 0;
    }

    const placementText = String(placement)
        .toLowerCase()
        .replace(/,/g, "");

    const numberMatch = placementText.match(/[\d.]+/);

    if (!numberMatch) {
        return 0;
    }

    const number = Number(numberMatch[0]);

    if (placementText.includes("lakh")) {
        return number * 100000;
    }

    if (placementText.includes("cr")) {
        return number * 10000000;
    }

    return number;
}


/* -----------------------------------------------------
   COURSE MATCHING
   ----------------------------------------------------- */

function courseMatches(college, preferredCourse) {
    if (!preferredCourse) {
        return false;
    }

    const searchCourse = preferredCourse
        .toLowerCase()
        .trim();

    const courses = Array.isArray(college.courses)
        ? college.courses
        : [];

    const courseText = courses
        .map(function (course) {
            return String(course).toLowerCase();
        })
        .join(" ");

    const collegeText = [
        college.name || "",
        college.type || "",
        courseText
    ]
        .join(" ")
        .toLowerCase();

    const searchWords = searchCourse
        .split(/\s+/)
        .filter(function (word) {
            return word.length > 2;
        });

    if (searchWords.length === 0) {
        return false;
    }

    return searchWords.some(function (word) {
        return collegeText.includes(word);
    });
}


/* -----------------------------------------------------
   LOCATION MATCHING
   ----------------------------------------------------- */

function locationMatches(college, preferredLocation) {
    if (!preferredLocation) {
        return false;
    }

    const searchLocation = preferredLocation
        .toLowerCase()
        .trim();

    const collegeLocation = String(
        college.location || ""
    ).toLowerCase();

    const collegeName = String(
        college.name || ""
    ).toLowerCase();

    return collegeLocation.includes(searchLocation) ||
        collegeName.includes(searchLocation);
}


/* -----------------------------------------------------
   CALCULATE COLLEGE MATCH SCORE
   ----------------------------------------------------- */

function getPriorityScore(college, priority) {
    const rating = Number(college.rating) || 0;
    const placement = getPlacementValue(college.placement);
    const fees = getBudgetValue(college.fees);

    switch (priority) {
        case "fees":
            return Math.max(0, 100 - (fees / 50000));

        case "placement":
            return placement;

        case "rating":
            return rating * 20;

        case "location":
            return locationMatches(
                college,
                getElement("advisorLocation")?.value
            )
                ? 100
                : 0;

        default:
            return rating * 20;
    }
}


/* -----------------------------------------------------
   GET AI RECOMMENDATIONS
   ----------------------------------------------------- */

async function getAIRecommendation() {
    const locationElement = getElement("advisorLocation");
    const courseElement = getElement("advisorCourse");
    const budgetElement = getElement("advisorBudget");
    const priorityElement = getElement("advisorPriority");

    const resultSection = getElement("aiResultSection");
    const resultsContainer = getElement("aiResults");

    if (
        !locationElement ||
        !courseElement ||
        !budgetElement ||
        !priorityElement ||
        !resultsContainer
    ) {
        console.error("AI Advisor elements were not found.");
        return;
    }

    const location = locationElement.value.trim();
    const course = courseElement.value.trim();
    const budget = budgetElement.value;
    const priority = priorityElement.value;

    if (!location || !course || !budget || !priority) {
        alert("Please complete all advisor fields.");
        return;
    }

    const submitButton = document.querySelector(
        ".advisor-submit-button"
    );

    if (submitButton) {
        submitButton.disabled = true;
        submitButton.querySelector("span").textContent =
            "Finding Colleges...";
    }

    resultsContainer.innerHTML = "";

    try {
        const colleges = await fetchColleges();

        const maximumBudget = getBudgetLimit(budget);

        const recommendations = colleges
            .map(function (college) {
                const collegeFees = getBudgetValue(college.fees);

                const matchesLocation = locationMatches(
                    college,
                    location
                );

                const matchesCourse = courseMatches(
                    college,
                    course
                );

                const matchesBudget =
                    collegeFees > 0 &&
                    (
                        budget === "4" ||
                        collegeFees <= maximumBudget
                    );

                let score = 0;

                if (matchesLocation) {
                    score += 35;
                }

                if (matchesCourse) {
                    score += 35;
                }

                if (matchesBudget) {
                    score += 20;
                }

                const priorityScore = getPriorityScore(
                    college,
                    priority
                );

                if (priorityScore > 0) {
                    score += 10;
                }

                const matchReasons = [];

                if (matchesLocation) {
                    matchReasons.push("Matches your preferred location");
                }

                if (matchesCourse) {
                    matchReasons.push("Offers your preferred course");
                }

                if (matchesBudget) {
                    matchReasons.push("Fits your selected budget");
                } else {
                    matchReasons.push("Fees differ from your selected budget");
                }

                if (priority === "fees") {
                    matchReasons.push("Considered based on your fee priority");
                }

                if (priority === "placement") {
                    matchReasons.push("Considered based on your placement priority");
                }

                if (priority === "rating") {
                    matchReasons.push("Considered based on your rating priority");
                }

                if (priority === "location" && matchesLocation) {
                    matchReasons.push("Matches your location priority");
                }

                return {
                    college: college,
                    score: Math.min(100, Math.round(score)),
                    matchesLocation: matchesLocation,
                    matchesCourse: matchesCourse,
                    matchesBudget: matchesBudget,
                    matchReasons: matchReasons
                };
            })
            .filter(function (recommendation) {
                // Include colleges with at least one matching preference.
                // Recommendations are ordered by their match score.
                return recommendation.score > 0;
            })
            .sort(function (first, second) {
                if (second.score !== first.score) {
                    return second.score - first.score;
                }

                return (
                    Number(second.college.rating) || 0
                ) - (
                        Number(first.college.rating) || 0
                    );
            })
            .slice(0, 6);

        displayAIResults(recommendations);

        if (resultSection) {
            resultSection.style.display = "block";

            resultSection.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }

    } catch (error) {
        console.error("AI Advisor error:", error);

        const errorMessage = error instanceof Error
            ? error.message
            : String(error);

        resultsContainer.innerHTML = `
        <div class="card design-card">
            <h3>Unable to load recommendations</h3>

            <p>
                ${escapeHTML(errorMessage)}
            </p>

            <p>
                Open the browser console for more details.
            </p>
        </div>
    `;

        if (resultSection) {
            resultSection.style.display = "block";
        }
    } finally {
        if (submitButton) {
            submitButton.disabled = false;

            const buttonText = submitButton.querySelector("span");

            if (buttonText) {
                buttonText.textContent =
                    "Get My Recommendations";
            }
        }
    }
}


/* -----------------------------------------------------
   DISPLAY AI RESULTS
   ----------------------------------------------------- */


function displayAIResults(recommendations) {
    const resultsContainer = getElement("aiResults");

    if (!resultsContainer) {
        console.error("AI results container was not found.");
        return;
    }

    if (
        !Array.isArray(recommendations) ||
        recommendations.length === 0
    ) {
        resultsContainer.innerHTML = `
            <div class="card design-card">
                <h3>No Matching Colleges Found</h3>

                <p>
                    We could not find colleges matching all
                    your preferences.
                </p>

                <p>
                    Try a different location, course,
                    or budget range.
                </p>
            </div>
        `;

        return;
    }

    resultsContainer.innerHTML = "";

    recommendations.forEach(function (recommendation) {
        const college = recommendation.college || recommendation;

        if (!college || !college.name) {
            console.warn(
                "Invalid college recommendation:",
                recommendation
            );

            return;
        }

        const collegeId = Number(college.id);

        const collegeName = escapeHTML(
            college.name || "Unknown College"
        );

        const location = escapeHTML(
            college.location || "Not available"
        );

        const type = escapeHTML(
            college.type || "Not available"
        );

        const rating = escapeHTML(
            String(college.rating ?? "Not available")
        );

        const fees = escapeHTML(
            college.fees || "Not available"
        );

        const placement = escapeHTML(
            college.placement || "Not available"
        );

        const matchScore = Number(
            recommendation.score ?? 0
        );

        const safeScore = Math.max(
            0,
            Math.min(100, Math.round(matchScore))
        );
        const matchReasons = Array.isArray(
            recommendation.matchReasons
        )
            ? recommendation.matchReasons
            : [];

        const matchReasonsHTML = matchReasons
            .map(function (reason) {
                return `
            <li>${escapeHTML(reason)}</li>
        `;
            })
            .join("");

        const courses = Array.isArray(college.courses)
            ? college.courses
            : [];

        const courseText = courses.length > 0
            ? courses
                .map(function (course) {
                    return escapeHTML(String(course));
                })
                .join(", ")
            : "Course information not available";

        const card = document.createElement("article");

        card.className = "card design-card ai-card";

        card.innerHTML = `
            <div class="ai-card-header">
                <span class="section-label">
                    MATCH SCORE
                </span>

                <strong>
                    ${safeScore}%
                </strong>
            </div>

            <h3>${collegeName}</h3>

            <p>${location}</p>
        <div class="ai-match-summary">

    <h4>Why This College Matches</h4>

    <ul>
        ${matchReasonsHTML}
    </ul>

</div>

            <div class="ai-card-details">

                <p>
                    <strong>Institution Type:</strong>
                    ${type}
                </p>

                <p>
                    <strong>Rating:</strong>
                    ${rating}
                </p>

                <p>
                    <strong>Fees:</strong>
                    ${fees}
                </p>

                <p>
                    <strong>Placement:</strong>
                    ${placement}
                </p>

                <p>
                    <strong>Courses:</strong>
                    ${courseText}
                </p>

            </div>

            <div class="ai-card-actions">

                <button
                    type="button"
                    class="primary"
                    data-action="view"
                >
                    View Details
                </button>

                <button
                    type="button"
                    class="secondary"
                    data-action="save"
                >
                    Save College
                </button>

            </div>
        `;

        const viewButton = card.querySelector(
            '[data-action="view"]'
        );

        const saveButton = card.querySelector(
            '[data-action="save"]'
        );

        if (viewButton) {
            viewButton.addEventListener("click", function () {
                viewCollege(collegeId);
            });
        }

        if (saveButton) {
            saveButton.addEventListener("click", function () {
                saveCollege(collegeId);
            });
        }

        resultsContainer.appendChild(card);
    });
}



/* =========================================================
   PROFILE MANAGEMENT
   ========================================================= */

function saveProfile() {
    const profile = {
        name: getElement("profileName")?.value.trim() || "",
        course: getElement("profileCourse")?.value.trim() || "",
        location: getElement("profileLocation")?.value.trim() || "",
        budget: getElement("profileBudget")?.value || "",
        priority: getElement("profilePriority")?.value || ""
    };

    localStorage.setItem(
        PROFILE_STORAGE_KEY,
        JSON.stringify(profile)
    );

    alert("Profile saved successfully.");
}


function loadProfile() {
    const savedProfile =
        localStorage.getItem(
            PROFILE_STORAGE_KEY
        );

    if (!savedProfile) {
        return;
    }

    let profile;

    try {
        profile =
            JSON.parse(savedProfile);
    }
    catch (error) {
        console.error(
            "Invalid profile data:",
            error
        );

        return;
    }

    const fields = {
        profileName: profile.name,
        profileCourse: profile.course,
        profileLocation: profile.location,
        profileBudget: profile.budget,
        profilePriority: profile.priority
    };

    Object.keys(fields).forEach(
        function (fieldId) {
            const field =
                getElement(fieldId);

            if (field) {
                field.value =
                    fields[fieldId] || "";
            }
        }
    );
}


function clearProfile() {
    const confirmed =
        confirm(
            "Are you sure you want to clear your profile?"
        );

    if (!confirmed) {
        return;
    }

    localStorage.removeItem(
        PROFILE_STORAGE_KEY
    );

    const fields = [
        "profileName",
        "profileCourse",
        "profileLocation",
        "profileBudget",
        "profilePriority"
    ];

    fields.forEach(function (fieldId) {
        const field =
            getElement(fieldId);

        if (field) {
            field.value = "";
        }
    });

    alert("Profile cleared.");
}


function loadAdvisorProfile() {
    const savedProfile =
        localStorage.getItem(
            PROFILE_STORAGE_KEY
        );

    if (!savedProfile) {
        return;
    }

    let profile;

    try {
        profile =
            JSON.parse(savedProfile);
    }
    catch (error) {
        console.error(
            "Invalid advisor profile:",
            error
        );

        return;
    }

    const fields = {
        advisorLocation: profile.location,
        advisorCourse: profile.course,
        advisorBudget: profile.budget,
        advisorPriority: profile.priority
    };

    Object.keys(fields).forEach(
        function (fieldId) {
            const field =
                getElement(fieldId);

            if (
                field &&
                fields[fieldId] !== undefined &&
                fields[fieldId] !== ""
            ) {
                field.value =
                    fields[fieldId];
            }
        }
    );
}

/* =========================================================
   SUPABASE AUTHENTICATION
   ========================================================= */

const LOGGED_IN_USER_KEY = "studentLensLoggedInUser";





function getLoggedInUser() {
    const userData = localStorage.getItem(
        LOGGED_IN_USER_KEY
    );

    if (!userData) {
        return null;
    }

    try {
        return JSON.parse(userData);
    } catch (error) {
        localStorage.removeItem(
            LOGGED_IN_USER_KEY
        );

        return null;
    }
}


async function isUserLoggedIn() {
    const user = await getSupabaseUser();

    return user !== null;
}


async function logout() {
    try {
        if (window.supabaseClient) {
            const { error } =
                await window.supabaseClient.auth.signOut();

            if (error) {
                console.error("Logout error:", error);
                alert("Unable to log out. Please try again.");
                return;
            }
        }

        localStorage.removeItem(LOGGED_IN_USER_KEY);

        window.location.href = getPagePath("index.html");

    } catch (error) {
        console.error("Unexpected logout error:", error);
        alert("Unable to log out. Please try again.");
    }
}

async function protectDashboard() {
    const currentPage =
        window.location.pathname.toLowerCase();

    const isDashboardPage =
        currentPage.includes("dashboard.html");

    if (!isDashboardPage) {
        return;
    }

    const user = await getSupabaseUser();

    if (!user) {
        alert(
            "Please log in to access your dashboard."
        );

        window.location.href =
            getPagePath("login.html");
    }
}


/* =========================================================
   PROTECTED DASHBOARD NAVIGATION
   ========================================================= */

async function goToDashboard() {
    const user = await getSupabaseUser();

    if (!user) {
        alert(
            "Please log in to access your dashboard."
        );

        window.location.href =
            getPagePath("login.html");

        return;
    }

    window.location.href =
        getPagePath("dashboard.html");
}


async function viewProfile() {
    const isLoggedIn =
        await requireLogin();

    if (!isLoggedIn) {
        return;
    }

    window.location.href =
        getPagePath("profile.html");
}


async function viewSavedColleges() {
    const isLoggedIn =
        await requireLogin();

    if (!isLoggedIn) {
        return;
    }

    window.location.href =
        getPagePath("saved-colleges.html");
}


function goToAIAdvisor() {
    window.location.href =
        getPagePath("ai-advisor.html");
}


function goToCompare() {
    window.location.href =
        getPagePath("compare.html");
}


function goToColleges() {
    window.location.href =
        getPagePath("colleges.html");
}// ===============================
// PAGE PATH HELPER
// ===============================




/* =========================================================
   DASHBOARD INITIALIZATION
   ========================================================= */

async function loadDashboard() {
    const user = await getSupabaseUser();

    if (!user) {
        return;
    }

    const loggedInUser = getLoggedInUser();
    const displayName =
        loggedInUser?.name ||
        user.user_metadata?.full_name ||
        user.email?.split("@")[0] ||
        "Student";

    const nameElements = document.querySelectorAll(
        "#dashboardUserName, #userName, #profileNameDisplay, [data-user-name]"
    );

    nameElements.forEach(function (element) {
        if (element.tagName === "INPUT") {
            element.value = displayName;
        } else {
            element.textContent = displayName;
        }
    });

    const emailElements = document.querySelectorAll(
        "#dashboardUserEmail, #userEmail, [data-user-email]"
    );

    emailElements.forEach(function (element) {
        element.textContent = user.email || "";
    });

    try {
        const savedIds = await getSavedCollegeIds();
        const countElements = document.querySelectorAll(
            "#savedCollegeCount, #savedCount, [data-saved-college-count]"
        );

        countElements.forEach(function (element) {
            element.textContent = String(savedIds.length);
        });
    } catch (error) {
        console.error("Dashboard saved-college count error:", error);
    }
}

/* =========================================================
   PAGE INITIALIZATION
   ========================================================= */

document.addEventListener("DOMContentLoaded", async function () {
    console.log("StudentLens loaded successfully.");
    await updateAuthenticationUI();

    const currentPage = window.location.pathname
        .split("/")
        .pop()
        .toLowerCase();

    const protectedPages = [
        "dashboard.html",
        "profile.html",
        "saved-colleges.html"
    ];

    // Protect only pages that require authentication.
    if (protectedPages.includes(currentPage)) {
        const isLoggedIn = await requireLogin();

        if (!isLoggedIn) {
            return;
        }
    }

    const collegeContainer = getElement("collegeContainer");

    if (collegeContainer) {
        applyCollegeFilters();
        loadHomepageSearch();
    }

    [
        "locationFilter",
        "courseFilter",
        "budgetFilter",
        "sortFilter"
    ].forEach(function (filterId) {
        const filter = getElement(filterId);

        if (filter) {
            filter.addEventListener(
                "change",
                applyCollegeFilters
            );
        }
    });

    const detailsContainer = getElement("collegeDetails");

    if (detailsContainer) {
        loadCollegeDetails();
    }

    const firstCollege = getElement("collegeOne");
    const secondCollege = getElement("collegeTwo");

    if (firstCollege && secondCollege) {
        loadComparisonColleges();
    }

    const savedContainer = getElement("savedCollegeContainer");

    if (savedContainer) {
        await loadSavedColleges();
    }

    // Load profile only on the profile page.
    if (currentPage === "profile.html") {
        await loadProfile();
    }

    // Load advisor profile only when the required page elements exist.
    if (getElement("advisorProfile")) {
        await loadAdvisorProfile();
    }

    // Load dashboard only on the dashboard page.
    if (currentPage === "dashboard.html") {
        await loadDashboard();
    }

    if (typeof loadRecentlyViewedColleges === "function") {
        await loadRecentlyViewedColleges();
    }

    if (typeof updateSavedCollegeCount === "function") {
        await updateSavedCollegeCount();
    }
});/* =========================================================
   COLLEGE COMPARISON FUNCTIONS
   ========================================================= */

/**
 * Add a college to the comparison list
 */
async function openCollegeComparison(collegeId) {
    const isLoggedIn = await requireLogin();

    if (!isLoggedIn) {
        return;
    }

    const storageKey =
        "studentLensCompareColleges";

    let comparisonIds = [];

    try {
        comparisonIds = JSON.parse(
            localStorage.getItem(storageKey) || "[]"
        );

    } catch (error) {
        comparisonIds = [];
    }

    if (!Array.isArray(comparisonIds)) {
        comparisonIds = [];
    }

    comparisonIds = comparisonIds.map(String);

    const normalizedId = String(collegeId);

    if (comparisonIds.includes(normalizedId)) {
        window.location.href =
            getPagePath("compare.html");

        return;
    }

    if (comparisonIds.length >= 3) {
        alert(
            "You can compare a maximum of 3 colleges."
        );

        return;
    }

    comparisonIds.push(normalizedId);

    localStorage.setItem(
        storageKey,
        JSON.stringify(comparisonIds)
    );

    alert("College added to comparison.");

    window.location.href =
        getPagePath("compare.html");
}


/**
 * Remove a college from comparison
 */
function removeCollegeFromComparison(collegeId) {

    const storageKey =
        "studentLensCompareColleges";

    let comparisonIds = [];

    try {

        comparisonIds = JSON.parse(
            localStorage.getItem(storageKey) || "[]"
        );

    } catch (error) {

        comparisonIds = [];

    }

    comparisonIds =
        Array.isArray(comparisonIds)
            ? comparisonIds.map(String)
            : [];

    const updatedIds =
        comparisonIds.filter(function (id) {

            return id !== String(collegeId);

        });

    localStorage.setItem(
        storageKey,
        JSON.stringify(updatedIds)
    );

    if (
        typeof loadComparisonPage === "function"
    ) {

        loadComparisonPage();

    } else {

        window.location.reload();

    }

}
// ============================================
// STUDENTLENS AUTHENTICATION
// ============================================

async function getSupabaseUser() {
    try {
        if (
            typeof supabaseClient === "undefined" ||
            !supabaseClient
        ) {
            console.error("Supabase client is not available.");
            return null;
        }

        const {
            data,
            error
        } = await supabaseClient.auth.getUser();

        if (error) {
            console.error("Unable to get Supabase user:", error);
            return null;
        }

        return data.user || null;

    } catch (error) {
        console.error("Authentication error:", error);
        return null;
    }
}

function getAuthRedirectUrl() {
    try {
        const currentUrl = new URL(window.location.href);
        const redirectUrl = new URL("dashboard.html", currentUrl);
        return redirectUrl.toString();
    } catch (error) {
        const baseOrigin =
            window.location.origin &&
                window.location.origin !== "null"
                ? window.location.origin
                : "";

        return baseOrigin
            ? `${baseOrigin}/pages/dashboard.html`
            : "/pages/dashboard.html";
    }
}

async function signInWithGitHub() {
    if (
        typeof window.supabaseClient === "undefined" ||
        !window.supabaseClient
    ) {
        throw new Error(
            "Supabase is not configured correctly. Check supabase-config.js."
        );
    }

    const redirectTo = getAuthRedirectUrl();

    const { data, error } = await window.supabaseClient.auth.signInWithOAuth({
        provider: "github",
        options: {
            redirectTo: redirectTo
        }
    });

    if (error) {
        throw error;
    }

    if (data && data.url) {
        window.location.href = data.url;
    }

    return data;
}

window.signInWithGitHub = signInWithGitHub;


// ============================================
// REQUIRE LOGIN
// ============================================

async function requireLogin() {
    const user = await getSupabaseUser();

    if (!user) {
        alert("Please log in to continue.");
        window.location.href = getPagePath("login.html");
        return false;
    }

    return true;
}
async function updateAuthenticationUI() {
    try {
        const user = await getSupabaseUser();

        const loginLinks = document.querySelectorAll(
            ".login-link, .nav-login"
        );

        const signupLinks = document.querySelectorAll(
            ".nav-button, .nav-signup"
        );

        if (user) {
            const userName =
                user.user_metadata?.full_name ||
                user.email?.split("@")[0] ||
                "User";

            // Update Login buttons to Logout
            loginLinks.forEach(function (link) {
                link.textContent = "Logout";
                link.href = "#";

                link.onclick = async function (event) {
                    event.preventDefault();

                    const { error } =
                        await supabaseClient.auth.signOut();

                    if (error) {
                        console.error("Logout error:", error);
                        alert("Logout failed. Please try again.");
                        return;
                    }

                    localStorage.removeItem("studentLensLoggedInUser");

                    window.location.href = getPagePath("index.html");
                };
            });

            // Update Get Started buttons to Dashboard
            signupLinks.forEach(function (link) {
                link.textContent = "Dashboard";
                link.href = getPagePath("dashboard.html");
                link.onclick = null;
            });

            // Update username elements
            document
                .querySelectorAll(
                    "#dashboardUserName, #userName, [data-user-name]"
                )
                .forEach(function (element) {
                    element.textContent = userName;
                });

            // Update email elements
            document
                .querySelectorAll(
                    "#dashboardUserEmail, #userEmail, [data-user-email]"
                )
                .forEach(function (element) {
                    element.textContent = user.email || "";
                });

        } else {
            // Show Login buttons
            loginLinks.forEach(function (link) {
                link.textContent = "Login";
                link.href = getPagePath("login.html");
                link.onclick = null;
            });

            // Show Get Started buttons
            signupLinks.forEach(function (link) {
                link.textContent = "Get Started";
                link.href = getPagePath("signup.html");
                link.onclick = null;
            });
        }

    } catch (error) {
        console.error("Authentication UI error:", error);
    }
}

// ============================================
// PAGE PATH
// ============================================

function getPagePath(pageName) {
    const currentPath =
        window.location.pathname.toLowerCase();

    const insidePagesFolder =
        currentPath.includes("/pages/") ||
        currentPath.includes("\\pages\\");

    if (insidePagesFolder) {
        if (pageName === "index.html") {
            return "../index.html";
        }

        return pageName;
    }

    if (pageName === "index.html") {
        return "index.html";
    }

    return "pages/" + pageName;
}


// ============================================
// NAVIGATION
// ============================================

async function goToDashboard() {
    const loggedIn = await requireLogin();

    if (!loggedIn) {
        return;
    }

    window.location.href =
        getPagePath("dashboard.html");
}


async function viewProfile() {
    const loggedIn = await requireLogin();

    if (!loggedIn) {
        return;
    }

    window.location.href =
        getPagePath("profile.html");
}


async function viewSavedColleges() {
    const loggedIn = await requireLogin();

    if (!loggedIn) {
        return;
    }

    window.location.href =
        getPagePath("saved-colleges.html");
}


function goToColleges() {
    window.location.href =
        getPagePath("colleges.html");
}