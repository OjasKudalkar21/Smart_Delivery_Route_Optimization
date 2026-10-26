cmake_minimum_required(VERSION 3.10)
project(RoutePilotEngine VERSION 1.0.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

# Enable compiler warnings
if(MSVC)
    add_compile_options(/W4 /std:c++17)
else()
    add_compile_options(-Wall -Wextra -pedantic)
    # Windows security compliance flags (ASLR + DEP)
    if(WIN32)
        add_link_options(-Wl,--nxcompat,--dynamicbase)
    endif()
endif()

# Set output directory to bin/
set(CMAKE_RUNTIME_OUTPUT_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}/bin)

# Engine Core Library
add_library(route_core STATIC
    src/Graph.cpp
    src/SampleData.cpp
    src/RouteOptimizer.cpp
    src/EngineHandler.cpp
)

target_include_directories(route_core PUBLIC
    ${CMAKE_CURRENT_SOURCE_DIR}/include
)

# Standalone Executable
add_executable(route_engine
    src/main.cpp
)

target_link_libraries(route_engine PRIVATE route_core)
